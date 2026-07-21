import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {BN} from 'bn.js';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import {AnchorProvider, Program} from '@coral-xyz/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  GOVERNANCE_PROGRAM_SEED,
  SYSTEM_PROGRAM_ID,
  getNativeTreasuryAddress,
  getRealm,
  getRealmConfigAddress,
  getTokenHoldingAddress,
  getTokenOwnerRecordAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance';
import {VoterStakeRegistry, IDL as VsrIdl} from './voter_stake_registry';
import {IdlAccounts} from '@coral-xyz/anchor';

export type RegistrarAccount = IdlAccounts<VoterStakeRegistry>['registrar'];
export type VoterAccount = IdlAccounts<VoterStakeRegistry>['voter'];

export const installCreateRealmCLI = (program: Command) => {
  program
    .command('create-realm')
    .option(
      '--spl-governance <pubkey>',
      'Spl governance program id',
      'govnSwjQsudMDMPfCpBoNStU5F715zE6quqdtgHUkJ1'
    )
    .option(
      '--vsr <pubkey>',
      'VSR plugin id',
      'vsr3ATm9Z53acbKprDzsfyzVgi9UJBX4CzJPLDitads'
    )
    .option('--community-mint-digits <number>', 'Community mint digits', '9')
    .option('--name <string>', 'Realm name', 'Vote aggregator demo 2')
    .action(createRealm);
};

const createRealm = async ({
  splGovernance,
  vsr,
  communityMintDigits,
  name,
}: {
  splGovernance: string;
  vsr: string;
  communityMintDigits: string;
  name: string;
}) => {
  const {sdk, provider} = context!;
  const splGov = splGovernanceProgram({
    programId: await parsePubkey(splGovernance),
    provider: new AnchorProvider(
      sdk.connection,
      {
        signTransaction: t => Promise.resolve(t),
        signAllTransactions: ts => Promise.resolve(ts),
        publicKey: PublicKey.default,
      },
      {}
    ),
  });
  const vsrProgram = new Program<VoterStakeRegistry>(VsrIdl, vsr, provider);

  const signers = [];

  let communityMint;
  {
    const kp = Keypair.generate();
    signers.push(kp);
    communityMint = kp.publicKey;
  }
  const communityMintDigitsCount = parseInt(communityMintDigits);

  let councilMint;
  {
    const kp = Keypair.generate();
    signers.push(kp);
    councilMint = kp.publicKey;
  }

  let {blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash();
  let tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: provider.publicKey!,
      newAccountPubkey: communityMint,
      space: MINT_SIZE,
      lamports:
        await sdk.connection.getMinimumBalanceForRentExemption(MINT_SIZE),
      programId: TOKEN_PROGRAM_ID,
    })
  );
  tx.add(
    createInitializeMint2Instruction(
      communityMint,
      communityMintDigitsCount,
      provider.publicKey!,
      null
    )
  );
  const communityToken = await getAssociatedTokenAddress(
    communityMint,
    provider.publicKey!
  );
  tx.add(
    createAssociatedTokenAccountInstruction(
      provider.publicKey!,
      communityToken,
      provider.publicKey!,
      communityMint
    )
  );
  tx.add(
    createMintToInstruction(
      communityMint,
      communityToken,
      provider.publicKey!,
      1000 * Math.pow(10, communityMintDigitsCount)
    )
  );

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: provider.publicKey!,
      newAccountPubkey: councilMint,
      space: MINT_SIZE,
      lamports:
        await sdk.connection.getMinimumBalanceForRentExemption(MINT_SIZE),
      programId: TOKEN_PROGRAM_ID,
    })
  );
  tx.add(
    createInitializeMint2Instruction(councilMint, 0, provider.publicKey!, null)
  );

  let r = await provider.sendAndConfirm!(tx, signers);
  console.log(
    `Creating community mint ${communityMint.toBase58()} and council mint ${councilMint.toBase58()}: ${r}`
  );

  ({blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash());
  tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });

  const [realmAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from(GOVERNANCE_PROGRAM_SEED), Buffer.from(name)],
    splGov.programId
  );
  const vsrId = await parsePubkey(vsr);
  tx.add(
    await splGov.methods
      .createRealm(name, {
        useCouncilMint: true,
        minCommunityWeightToCreateGovernance: new BN(1),
        communityMintMaxVoterWeightSource: {
          supplyFraction: new BN(10000000000) as any,
        },
        communityTokenConfigArgs: {
          useVoterWeightAddin: true,
          useMaxVoterWeightAddin: false,
          tokenType: {liquid: {}},
        },
        councilTokenConfigArgs: {
          useVoterWeightAddin: false,
          useMaxVoterWeightAddin: false,
          tokenType: {membership: {}},
        },
      })
      .accountsStrict({
        realmAddress,
        realmAuthority: provider.publicKey!,
        communityTokenMint: communityMint,
        communityTokenHoldingAddress: await getTokenHoldingAddress(
          splGov.programId,
          realmAddress,
          communityMint
        ),
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .remainingAccounts([
        {
          pubkey: councilMint,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: await getTokenHoldingAddress(
            splGov.programId,
            realmAddress,
            councilMint
          ),
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: await getRealmConfigAddress(splGov.programId, realmAddress),
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: vsrId,
          isWritable: false,
          isSigner: false,
        },
      ])
      .instruction()
  );
  const councilTor = await getTokenOwnerRecordAddress(
    splGov.programId,
    realmAddress,
    councilMint,
    provider.publicKey!
  );

  tx.add(
    await splGov.methods
      .createTokenOwnerRecord()
      .accountsStrict({
        governingTokenMint: councilMint,
        realm: realmAddress,
        governingTokenOwner: provider.publicKey!,
        tokenOwnerRecordAddress: councilTor,
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction()
  );

  tx.add(
    await splGov.methods
      .depositGoverningTokens(new BN(1))
      .accountsStrict({
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        realm: realmAddress,
        governingTokenOwner: provider.publicKey!,
        tokenOwnerRecordAddress: councilTor,
        governingTokenHoldingAddress: await getTokenHoldingAddress(
          splGov.programId,
          realmAddress,
          councilMint
        ),
        governingTokenSource: councilMint,
        governingTokenSourceAuthority: provider.publicKey!,
        realmConfigAddress: await getRealmConfigAddress(
          splGov.programId,
          realmAddress
        ),
      })
      .instruction()
  );

  const [registrar, registrarBump] = PublicKey.findProgramAddressSync(
    [
      realmAddress.toBuffer(),
      Buffer.from('registrar', 'utf-8'),
      communityMint.toBuffer(),
    ],
    vsrId
  );
  tx.add(
    await vsrProgram.methods
      .createRegistrar(registrarBump)
      .accountsStrict({
        realm: realmAddress,
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
        registrar,
        governanceProgramId: splGov.programId,
        realmGoverningTokenMint: communityMint,
        realmAuthority: provider.publicKey!,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction()
  );

  r = await provider.sendAndConfirm!(tx);
  console.log(`Creating realm ${name}: ${r}`);

  ({blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash());
  tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });

  const [governanceAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('account-governance'),
      realmAddress.toBuffer(),
      realmAddress.toBuffer(),
    ],
    splGov.programId
  );

  tx.add(
    await splGov.methods
      .createGovernance({
        communityVetoVoteThreshold: {disabled: {}},
        minCommunityWeightToCreateProposal: new BN(1),
        minTransactionHoldUpTime: 0,
        votingBaseTime: 216000,
        communityVoteTipping: {disabled: {}},
        councilVetoVoteThreshold: {yesVotePercentage: 60 as any},
        communityVoteThreshold: {yesVotePercentage: 60 as any},
        councilVoteThreshold: {yesVotePercentage: 60 as any},
        minCouncilWeightToCreateProposal: new BN(1),
        councilVoteTipping: {strict: {}},
        votingCoolOffTime: 43200,
        depositExemptProposalCount: 10,
      })
      .accountsStrict({
        realm: realmAddress,
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenOwnerRecord: PublicKey.default,
        governanceAddress: governanceAddress,
        governedAccountAddress: realmAddress,
        createAuthority: provider.publicKey!,
      })
      .instruction()
  );

  const nativeTreasuryAddress = await getNativeTreasuryAddress(
    splGov.programId,
    governanceAddress
  );
  tx.add(
    await splGov.methods
      .createNativeTreasury()
      .accountsStrict({
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
        governance: governanceAddress,
        nativeTreasuryAddress,
      })
      .instruction()
  );

  tx.add(
    await vsrProgram.methods
      .configureVotingMint(
        0, // idx
        0, // digitShift
        new BN(LAMPORTS_PER_SOL), // baselineVoteWeightScaledFactor
        new BN(0), // maxExtraLockupVoteWeightScaledFactor
        new BN(31536000), // lockup_saturation_secs
        governanceAddress
      )
      .accountsStrict({
        registrar,
        realmAuthority: provider.publicKey!,
        mint: communityMint,
      })
      .remainingAccounts([
        {
          pubkey: communityMint,
          isWritable: false,
          isSigner: false,
        },
      ])
      .instruction()
  );

  tx.add(
    await splGov.methods
      .setRealmAuthority({setChecked: {}})
      .accountsStrict({
        realm: realmAddress,
        realmAuthority: provider.publicKey!,
      })
      .remainingAccounts([
        {
          pubkey: governanceAddress,
          isWritable: false,
          isSigner: false,
        },
      ])
      .instruction()
  );

  r = await provider.sendAndConfirm!(tx);
  console.log(`Configuring realm ${name}: ${r}`);
};
