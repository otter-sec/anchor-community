import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { assert } from "chai";
import { setupTests } from "./utils";
import { AdminFlags, deriveInvestorPda, MediciFlags, RwaRbacClient } from "../client/src/index";
import {
  getIdentityAccountFromOwner,
  getIdentityAccountPda,
  getIdentityRegistryPda,
  getPolicyEngineAccount,
  getTrackerAccountPda,
  getWalletIdentityAccount,
  getWalletIdentityAccountPda,
} from "@dstoken-solana/rwa-token-sdk";
import { IssueTokensArgs } from "../client/src/types/instructions";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

describe("CPI End to End Tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  let rwaRbacClient: RwaRbacClient;
  let setup;
  let mint: string;
  let connection: Connection;
  let investorPda: string;

  const INVESTOR_ID = "d1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
  const PLACEHOLDER_HASH1 = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
  const PLACEHOLDER_HASH2 = "b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

  before(async () => {
    setup = await setupTests();
    mint = setup.assetMint.toString();
    investorPda = deriveInvestorPda(
      INVESTOR_ID,
      getIdentityRegistryPda(mint)
    ).toString();
    connection = setup.config.connection;
    rwaRbacClient = new RwaRbacClient(setup.config, provider);
  });

  it("Create AssetAccessController successfully", async () => {
    const ix = await rwaRbacClient.createAssetAccessControllerIxn({
      payer: setup.payer,
      admin: setup.signer1,
      assetMint: setup.assetMint,
      decimals: 2,
      name: "Test Class Asset",
      uri: "https://test.com",
      symbol: "TFT",
      interestRate: null,
    });

    const cb = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
    await sendAndConfirmTransaction(connection, new Transaction().add(cb, ix), [
      setup.payerKp,
      setup.signer1Kp,
      setup.assetMintKp,
    ]);
    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(
      controllerAccount.controllerAuthority.equals(setup.controllerAuthority)
    );
    assert.equal(
      controllerAccount.controllerAuthorityBump,
      setup.controllerAuthorityBump
    );
    assert(controllerAccount.admin.equals(setup.signer1));
    assert(controllerAccount.assetMint.equals(setup.assetMint));
    assert(controllerAccount.userRolesCount.eqn(0));
  });

  it("Create UserRole 1 successfully", async () => {
    const name = "Role1";
    const allowedAdminIxs = AdminFlags.NONE;
    const allowedMediciIxs = MediciFlags.ALL; // Allow All

    const ix = await rwaRbacClient.createUserRoleIxn({
      name,
      allowedAdminIxs,
      allowedMediciIxs,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });
    const ix2 = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [setup.signer1],
      userRole: setup.userRole1,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });

    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(...[ix, ix2]),
      [setup.payerKp, setup.signer1Kp]
    );

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(controllerAccount.userRolesCount.eqn(1));

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert(
      userRoleAccount.assetAccessController.equals(setup.assetAccessController)
    );
    assert(userRoleAccount.id.eq(setup.roleId1));
    assert.equal(userRoleAccount.name, name);
    assert(userRoleAccount.allowedAdminIxs.eqn(allowedAdminIxs));
    assert.equal(userRoleAccount.allowedMediciIxs.toNumber(), allowedMediciIxs);
    assert.equal(userRoleAccount.users.length, 1);
  });

  it("CPI: Update Asset Metadata", async () => {
    const updateAssetMetadataArgs = {
      name: "Test Class Asset - Updated",
      assetMint: mint,
      authority: setup.controllerAuthority.toString(), // ControllerAuthority
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
    };
    const updateIx = await rwaRbacClient.assetController.updateAssetMetadata(
      updateAssetMetadataArgs,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(updateIx),
      [setup.payerKp, setup.signer1Kp]
    );
  });
  
  it("CPI: Attach to Policy Engine", async () => {
    const ix = await rwaRbacClient.policyEngine.attachPolicy(
      {
        authority: setup.controllerAuthority.toString(), // ControllerAuthority
        payer: setup.payer.toString(), // Payer Account
        assetMint: mint,
        identityFilter: {
          simple: [
            {
              single: [
                {
                  target: { bothOr: {} },
                  mode: { include: {} },
                  level: { level: [1] },
                },
              ],
            },
          ],
        },
        policyType: {
          transactionAmountLimit: {
            limit: new BN(10000),
          },
        },
      },
      setup.signer1, // User Account
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
    const policyAccountData = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyAccountData.policies.length, 1);
  });

  it("CPI: Detach from Policy Account", async () => {
    let policyAccountData = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );

    for (const policy of policyAccountData?.policies ?? []) {
      const ix = await rwaRbacClient.policyEngine.detachPolicy(
        {
          authority: setup.controllerAuthority.toString(), // ControllerAuthority
          payer: setup.payer.toString(), // Payer Account
          assetMint: mint,
          hash: policy.hash,
        },
        setup.signer1, // User Account
        setup.assetAccessController,
        setup.userRole1
      );
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer1Kp,
      ]);
    }
    policyAccountData = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyAccountData.policies.length, 0);
  });

  it("CPI: Register Investor", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      investorId: INVESTOR_ID,
      collisionHash: PLACEHOLDER_HASH2,
      levels: [1, 5],
      expiries: [
        new BN(Date.now() / 1000 + 24 * 60 * 60),
        new BN(Date.now() / 1000 + 30 * 60 * 60),
      ],
      proofHashes: [PLACEHOLDER_HASH1, PLACEHOLDER_HASH2],
      country: 1,
    };
    const ixReturn = await rwaRbacClient.identityMetadataRegistry.setupUserIxns(
      args,
      setup.assetAccessController,
      setup.userRole1
    );

    const tx = new Transaction().add(...ixReturn.ixs);
    const sig = await sendAndConfirmTransaction(
      connection,
      tx,
      [setup.payerKp, setup.signer1Kp],
      {
        commitment: "confirmed",
      }
    );

    const txLogs = await connection.getTransaction(sig, {
      commitment: "confirmed",
    });
    const innerIxs = txLogs.meta.innerInstructions[0].instructions;
    const events = rwaRbacClient.identityMetadataRegistry.parseEvents(innerIxs);

    // Verify event logging.
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.name, "registerInvestorEvent");
    assert.equal(event.data.investorId, args.investorId);
    assert.equal(event.data.level, args.levels[0]);
    assert(event.data.expiry.eq(args.expiries[0]));
    assert.equal(event.data.collisionHash, args.collisionHash);
    assert(event.data.sender.equals(new PublicKey(args.payer)));

    // Validate Investor and IdentityAccount
    const identityAccountPda = getIdentityAccountPda(mint, investorPda);
    const investorAccount =
      await rwaRbacClient.identityMetadataRegistry.imrProgram.account.investor.fetch(
        investorPda
      );
    assert.equal(investorAccount.investorId, args.investorId);
    assert.equal(investorAccount.collisionHash, args.collisionHash);
    assert(investorAccount.authority.equals(setup.controllerAuthority));
    assert.equal(investorAccount.lastUpdatedBy.toString(), args.payer);
    assert(investorAccount.identityAccount.equals(identityAccountPda));
    assert.equal(investorAccount.levels.length, 2);
    investorAccount.levels.map((x, idx) => {
      assert.equal(x.level, args.levels[idx]);
      assert.equal(x.proofHash, args.proofHashes[idx]);
    });

    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      investorPda.toString(),
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.owner.toString(), investorPda);
    assert.equal(identityAccount.levels.length, 2);
    identityAccount.levels.map((x, idx) => {
      assert.equal(x.level, args.levels[idx]);
      assert(x.expiry.eq(args.expiries[idx]));
    });
  });

  it("CPI: Create Identity Account for non-Investor", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      owner: setup.user2.toString(), // Target Account
      assetMint: mint,
      levels: [1],
      expiry: [new BN(Date.now() / 1000 + 24 * 60 * 60)],
      country: 1,
    };
    const ixReturn = await rwaRbacClient.identityRegistry.setupUserIxns(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    const ix2 = await createAssociatedTokenAccountInstruction(
      setup.payer,
      getAssociatedTokenAddressSync(
        new PublicKey(mint),
        new PublicKey(setup.user2),
        false,
        TOKEN_2022_PROGRAM_ID
      ),
      setup.user2,
      new PublicKey(mint),
      TOKEN_2022_PROGRAM_ID
    );

    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(...ixReturn.ixs, ix2),
      [setup.payerKp, setup.signer1Kp]
    );

    // Validate IdentityAccount
    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      setup.user2,
      rwaRbacClient.provider
    );
    const walletIdentityAccount = await getWalletIdentityAccount(
      getWalletIdentityAccountPda(mint, setup.user2),
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.owner.toString(), args.owner);
    assert.equal(identityAccount.levels.length, 1);
    assert.equal(identityAccount.levels[0].level, args.levels[0]);
    assert(identityAccount.levels[0].expiry.eq(args.expiry[0]));
    assert(walletIdentityAccount.wallet.equals(setup.user2));
    assert(
      walletIdentityAccount.identityAccount.equals(
        getIdentityAccountPda(mint, setup.user2)
      )
    );
  });

  it("CPI: Add Levels through Investor", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      investorId: INVESTOR_ID,
      levels: [6, 7, 8],
      expiries: [
        new BN(Date.now() / 1000 + 24 * 60 * 60),
        new BN(Date.now() / 1000 + 24 * 60 * 60),
        new BN(Date.now() / 1000 + 24 * 60 * 60),
      ],
      proofHashes: [PLACEHOLDER_HASH1, PLACEHOLDER_HASH2, PLACEHOLDER_HASH1],
    };
    const ix = await rwaRbacClient.identityMetadataRegistry.addLevels(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    const cb = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
    await sendAndConfirmTransaction(connection, new Transaction().add(cb, ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    // Validate Investor and IdentityAccount
    const investorAccount =
      await rwaRbacClient.identityMetadataRegistry.imrProgram.account.investor.fetch(
        investorPda
      );
    assert(
      investorAccount.identityRegistry.equals(getIdentityRegistryPda(mint))
    );
    assert.equal(investorAccount.lastUpdatedBy.toString(), args.payer);
    assert.equal(investorAccount.levels.length, 5);
    investorAccount.levels.slice(2).map((v, idx) => {
      assert.equal(v.level, args.levels[idx]);
      assert.equal(v.proofHash, args.proofHashes[idx]);
    });

    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      investorPda,
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.levels.length, 5);
    identityAccount.levels.slice(2).map((v, idx) => {
      assert.equal(v.level, args.levels[idx]);
      assert(v.expiry.eq(args.expiries[idx]));
    });
  });

  it("CPI: Remove Levels through Investor", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      investorId: INVESTOR_ID,
      levels: [6, 7, 8],
      enforceLimits: true,
    };
    const ix = await rwaRbacClient.identityMetadataRegistry.removeLevels(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    const cb = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(cb, ix),
      [setup.payerKp, setup.signer1Kp],
      {
        skipPreflight: true,
      }
    );

    // Validate Investor and IdentityAccount
    const investorAccount =
      await rwaRbacClient.identityMetadataRegistry.imrProgram.account.investor.fetch(
        investorPda
      );
    assert.equal(investorAccount.lastUpdatedBy.toString(), args.payer);
    assert.equal(investorAccount.levels.length, 2);
    assert.equal(investorAccount.levels[0].level, 1);
    assert.equal(investorAccount.levels[1].level, 5);

    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      investorPda,
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.levels.length, 2);
    assert.equal(identityAccount.levels[0].level, 1);
    assert.equal(identityAccount.levels[1].level, 5);
  });

  it("CPI: Attach Wallet to Identity", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      owner: investorPda,
      assetMint: mint,
      wallet: setup.user1,
    };
    const ix = await rwaRbacClient.identityRegistry.attachWalletToIdentityIxn(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    const ix2 = await createAssociatedTokenAccountInstruction(
      setup.payer,
      getAssociatedTokenAddressSync(
        new PublicKey(mint),
        new PublicKey(setup.user1),
        false,
        TOKEN_2022_PROGRAM_ID
      ),
      setup.user1,
      new PublicKey(mint),
      TOKEN_2022_PROGRAM_ID
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix, ix2),
      [setup.payerKp, setup.signer1Kp]
    );

    // Check wallet count
    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      investorPda,
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.numWallets, 2);
  });

  it("Add Wallet by Investor", async () => {
    const ix =
      await rwaRbacClient.identityMetadataRegistry.attachWalletByInvestor({
        payer: setup.payer.toString(), // Payer Account
        signer: setup.user1.toString(), // User Account
        investorId: INVESTOR_ID,
        assetMint: mint,
        newWallet: setup.user3,
      });

    const ix2 = await createAssociatedTokenAccountInstruction(
      setup.payer,
      getAssociatedTokenAddressSync(
        new PublicKey(mint),
        new PublicKey(setup.user3),
        false,
        TOKEN_2022_PROGRAM_ID
      ),
      setup.user3,
      new PublicKey(mint),
      TOKEN_2022_PROGRAM_ID
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix, ix2),
      [setup.payerKp, setup.user1Kp]
    );

    // Check wallet count
    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      investorPda,
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.numWallets, 3);

    const newWalletIdentityAccount = await getWalletIdentityAccount(
      getWalletIdentityAccountPda(mint, setup.user3),
      rwaRbacClient.provider
    );
    const identityAccountPda = getIdentityAccountPda(mint, investorPda);
    assert(newWalletIdentityAccount.identityAccount.equals(identityAccountPda));
    assert.equal(newWalletIdentityAccount.wallet.toString(), setup.user3);
  });

  it("CPI: Detach Wallet from Identity", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      owner: investorPda,
      assetMint: mint,
      wallet: setup.user3,
    };
    const ix = await rwaRbacClient.identityRegistry.detachWalletFromIdentityIxn(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    // Check wallet count
    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      args.owner,
      rwaRbacClient.provider
    );
    assert.equal(identityAccount.numWallets, 2);
  });

  it("CPI: Change Country", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      investorId: INVESTOR_ID,
      country: 50,
    };
    const ix = await rwaRbacClient.identityMetadataRegistry.changeCountry(
      args,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Change Counters", async () => {
    const args = {
      authority: setup.controllerAuthority,
      payer: setup.payer.toString(), // Payer Account
      assetMint: mint,
      removedCounters: Buffer.from(""),
      addedCounters: [
        {
          id: 0,
          identityFilter: {
            simple: [
              {
                single: [
                  {
                    target: { receiver: {} },
                    mode: { include: {} },
                    level: { level: [1] },
                  },
                ],
              },
            ],
          } as any,
          value: new BN(0),
        },
        {
          id: 1,
          identityFilter: {
            simple: [
              {
                single: [
                  {
                    target: { receiver: {} },
                    mode: { include: {} },
                    level: { country: [2] },
                  },
                ],
              },
            ],
          },
          value: new BN(0),
        } as any,
      ],
    };
    const ix = await rwaRbacClient.policyEngine.changeCounters(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Issue Tokens", async () => {
    const issueArgs: IssueTokensArgs = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      amount: new BN(1000000),
      investorId: INVESTOR_ID,
      wallet: setup.user1,
      issuanceTimestamp: new BN(Date.now() / 1000),
    };
    const issueTokenIxns = await rwaRbacClient.assetController.issueTokenIxns(
      issueArgs,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(issueTokenIxns),
      [setup.payerKp, setup.signer1Kp],
      {
        skipPreflight: true,
      }
    );

    const policyEngine = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyEngine.counters[0].value.toString(), "1");
  });

  it("CPI: Seize Tokens", async () => {
    const args = {
      amount: new BN(1),
      from: setup.user1,
      to: setup.user2,
      authority: setup.controllerAuthority,
      assetMint: mint,
      reason: "test",
    };
    const ix = await rwaRbacClient.assetController.seizeTokensIxn(
      args,
      INVESTOR_ID,
      setup.signer1.toString(),
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const policyEngine = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyEngine.counters[0].value.toString(), "1");
  });

  it("CPI: Set Counters", async () => {
    const args = {
      authority: setup.controllerAuthority,
      payer: setup.payer.toString(), // Payer Account
      assetMint: mint,
      changedCounters: [0],
      values: [new BN(2)],
    };
    const ix = await rwaRbacClient.policyEngine.setCounters(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const policyEngine = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyEngine.counters[0].value.toString(), "2");
  });

  it("CPI: Revoke Tokens from user2", async () => {
    const revokeIx = await rwaRbacClient.assetController.revokeTokenIxn(
      {
        owner: setup.user2,
        wallet: setup.user2,
        assetMint: mint,
        amount: new BN(1),
        authority: setup.controllerAuthority.toString(), // ControllerAuthority
        reason: "test",
      },
      setup.signer1, // User Account
      setup.assetAccessController,
      setup.userRole1,
      null
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(revokeIx),
      [setup.payerKp, setup.signer1Kp],
      {
        skipPreflight: true,
      }
    );

    const policyEngine = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(policyEngine.counters[0].value.toString(), "1");
  });

  it("CPI: Remove Identity Account for non-Investor", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      owner: setup.user2.toString(), // Target Account
      assetMint: mint,
      authority: setup.controllerAuthority.toString(),
    };
    const ixReturn = await rwaRbacClient.identityRegistry.removeUserIxn(
      args,
      setup.assetAccessController,
      setup.userRole1
    );

    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ixReturn),
      [setup.payerKp, setup.signer1Kp]
    );

    // Validate IdentityAccount
    const identityAccount = await getIdentityAccountFromOwner(
      mint,
      setup.user2,
      rwaRbacClient.provider
    );
    assert.isUndefined(identityAccount);
  });

  it("CPI: Change Counter Limits", async () => {
    const args = {
      authority: setup.controllerAuthority,
      payer: setup.payer.toString(), // Payer Account
      assetMint: mint,
      removedCounterLimits: Buffer.from(""),
      addedCounterLimits: [],
    };
    const ix = await rwaRbacClient.policyEngine.changeCounterLimits(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Change Mapping", async () => {
    // Set mapping for country 1 to US region (Level = 10).
    const changeMappingIx = await rwaRbacClient.policyEngine.changeMapping(
      {
        authority: setup.controllerAuthority,
        payer: setup.payer.toString(), // Payer Account
        assetMint: mint,
        mappingSource: [1],
        mappingValue: [10],
      },
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(changeMappingIx),
      [setup.payerKp, setup.signer1Kp]
    );

    const { mapping } = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(mapping[1], 10);
  });

  it("CPI: Freeze Token Account", async () => {
    const freezeIx = await rwaRbacClient.assetController.freezeTokenIxn(
      {
        authority: setup.controllerAuthority.toString(), // ControllerAuthority
        payer: setup.payer.toString(), // Payer Account
        signer: setup.signer1.toString(), // User Account
        owner: setup.user1,
        assetMint: mint,
      },
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(freezeIx),
      [setup.payerKp, setup.signer1Kp]
    );
  });

  it("CPI: Thaw Token Account", async () => {
    const thawIx = await rwaRbacClient.assetController.thawTokenIxn(
      {
        authority: setup.controllerAuthority.toString(), // ControllerAuthority
        payer: setup.payer.toString(), // Payer Account
        signer: setup.signer1.toString(), // User Account
        owner: setup.user1,
        assetMint: mint,
      },
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(thawIx), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Revoke Tokens", async () => {
    const revokeIx = await rwaRbacClient.assetController.revokeTokenIxn(
      {
        owner: null,
        wallet: setup.user1,
        assetMint: mint,
        amount: new BN(999999),
        authority: setup.controllerAuthority.toString(), // ControllerAuthority
        reason: "test",
      },
      setup.signer1, // User Account
      setup.assetAccessController,
      setup.userRole1,
      INVESTOR_ID
    );
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(revokeIx),
      [setup.payerKp, setup.signer1Kp],
      {
        skipPreflight: true,
      }
    );
  });

  it("CPI: Add Lock", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      authority: setup.controllerAuthority.toString(), // ControllerAuthority-
      owner: investorPda,
      assetMint: mint,
      reason: new BN(1),
      reasonString: "test",
      amount: new BN(100),
      lockTime: new BN(Date.now() / 1000),
    };
    const ix = await rwaRbacClient.policyEngine.addLock(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Remove Lock", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      authority: setup.controllerAuthority.toString(), // ControllerAuthority-
      owner: investorPda,
      assetMint: mint,
      index: 0,
    };
    const ix = await rwaRbacClient.policyEngine.removeLock(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("CPI: Remove Investor", async () => {
    // Detach additional wallet first to allow revoke IdentityAccount.
    const detachIx =
      await rwaRbacClient.identityRegistry.detachWalletFromIdentityIxn(
        {
          payer: setup.payer.toString(), // Payer Account
          signer: setup.signer1.toString(), // User Account
          owner: investorPda,
          assetMint: mint,
          wallet: setup.user1,
        },
        setup.assetAccessController,
        setup.userRole1
      );
    const args = {
      payer: setup.payer.toString(), // Payer Account
      signer: setup.signer1.toString(), // User Account
      assetMint: mint,
      investorId: INVESTOR_ID,
    };

    const removeIx =
      await rwaRbacClient.identityMetadataRegistry.removeInvestor(
        args,
        setup.assetAccessController,
        setup.userRole1
      );
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(...[detachIx, removeIx]),
      [setup.payerKp, setup.signer1Kp],
      {
        commitment: "confirmed",
      }
    );

    const txLogs = await connection.getTransaction(sig, {
      commitment: "confirmed",
    });
    const innerIxs = txLogs.meta.innerInstructions[1].instructions; // second ix in tx
    const events = rwaRbacClient.identityMetadataRegistry.parseEvents(innerIxs);

    // Verify event logging.
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.name, "removeInvestorEvent");
    assert.equal(event.data.investorId, args.investorId);
    assert(event.data.sender.equals(new PublicKey(args.payer)));

    // Validate Investor and IdentityAccount
    const identityAccountPda = getIdentityAccountPda(
      mint,
      investorPda.toString()
    );
    assert.isNull(
      await rwaRbacClient.provider.connection.getAccountInfo(
        new PublicKey(investorPda)
      )
    );
    assert.isNull(
      await rwaRbacClient.provider.connection.getAccountInfo(identityAccountPda)
    );

    const trackerAccountPda = getTrackerAccountPda(
      mint,
      investorPda.toString()
    );
    assert.isNull(
      await rwaRbacClient.provider.connection.getAccountInfo(
        new PublicKey(trackerAccountPda)
      )
    );
  });

  it("CPI: Change Issuance Policies", async () => {
    const args = {
      payer: setup.payer.toString(), // Payer Account
      authority: setup.controllerAuthority.toString(), // ControllerAuthority
      assetMint: mint,
      issuancePolicies: {
        disallowBackdating: true,
        maxSupply: new BN(1000000),
        usLockPeriod: new BN(60),
        nonUsLockPeriod: new BN(30),
      },
    };
    const ix = await rwaRbacClient.policyEngine.changeIssuancePolicies(
      args,
      setup.signer1,
      setup.assetAccessController,
      setup.userRole1
    );
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    // Verify that issuance policies is updated correctly.
    const { issuancePolicies } = await getPolicyEngineAccount(
      mint,
      rwaRbacClient.provider
    );
    assert.equal(
      issuancePolicies.disallowBackdating,
      args.issuancePolicies.disallowBackdating
    );
    assert(issuancePolicies.maxSupply.eq(args.issuancePolicies.maxSupply));
    assert(
      issuancePolicies.usLockPeriod.eq(args.issuancePolicies.usLockPeriod)
    );
    assert(
      issuancePolicies.nonUsLockPeriod.eq(args.issuancePolicies.nonUsLockPeriod)
    );
  });
});
