import * as anchor from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { setupTests } from "./utils";
import {
  RwaRbacClient,
  AdminFlags,
  MediciFlags,
  computeFlags,
} from "../client/src/index";
import { assert } from "chai";

describe("Admin Ixs Test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.AnchorProvider.env();

  let rwaRbacClient: RwaRbacClient;
  let setup;
  let connection: Connection;

  before(async () => {
    setup = await setupTests();
    connection = setup.config.connection;
    rwaRbacClient = new RwaRbacClient(setup.config, provider);
  });

  it("Fails to create AssetAccessController with unauthorized signer", async () => {
    const ix = await rwaRbacClient.createAssetAccessControllerIxn({
      payer: setup.payer,
      admin: setup.signer2,
      assetMint: setup.assetMint,
      decimals: 2,
      name: "Test Class Asset",
      uri: "https://test.com",
      symbol: "TFT",
      interestRate: null,
    });
    const cb = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 });

    try {
      await sendAndConfirmTransaction(
        connection,
        new Transaction().add(cb, ix),
        [setup.payerKp, setup.signer2Kp, setup.assetMintKp]
      );
      assert(false);
    } catch (err) {
      assert(err.toString().includes("UnauthorizedSigner"));
    }
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

  it("Fails to create UserRole with invalid flag bits", async () => {
    const name = "Role1";
    const allowedAdminIxs = 1 << 20;
    const allowedMediciIxs = computeFlags(MediciFlags.ADD_LEVELS);

    try {
      const ix = await rwaRbacClient.createUserRoleIxn({
        name,
        allowedAdminIxs,
        allowedMediciIxs,
        payer: setup.payer,
        user: setup.signer1,
        assetAccessController: setup.assetAccessController,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer1Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidFlags"));
    }
  });

  it("Create UserRole 1 successfully with Admin", async () => {
    const name = "Role1";
    const allowedAdminIxs = computeFlags(AdminFlags.CREATE_OR_DELETE_USER_ROLE);
    const allowedMediciIxs = computeFlags(MediciFlags.ADD_LEVELS);

    const ix = await rwaRbacClient.createUserRoleIxn({
      name,
      allowedAdminIxs,
      allowedMediciIxs,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert(
      userRoleAccount.assetAccessController.equals(setup.assetAccessController)
    );
    assert(userRoleAccount.id.eq(setup.roleId1));
    assert.equal(userRoleAccount.name, name);
    assert(userRoleAccount.allowedAdminIxs.eqn(allowedAdminIxs));
    assert(userRoleAccount.allowedMediciIxs.eqn(allowedMediciIxs));
    assert.equal(userRoleAccount.users.length, 0);

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(controllerAccount.userRolesCount.eqn(1));
  });

  it("Fails to create UserRole if unauthorized", async () => {
    try {
      const name = "Role2";
      const allowedAdminIxs = AdminFlags.NONE;
      const allowedMediciIxs = MediciFlags.NONE;

      // Signer 2 is not a controller admin and has not been added to a valid role.
      const ix = await rwaRbacClient.createUserRoleIxn({
        name,
        allowedAdminIxs,
        allowedMediciIxs,
        payer: setup.payer,
        user: setup.signer2,
        assetAccessController: setup.assetAccessController,
        authorizedUserRole: setup.userRole1,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer2Kp,
      ]);
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer2Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidUserRole"));
    }
  });

  it("Assign users to UserRole 1 successfully with Admin", async () => {
    const userRoleDataLenPre = (
      await connection.getAccountInfo(setup.userRole1, "processed")
    ).data.length;
    const usersToAssign = [setup.signer2, setup.signer3, setup.payer];
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign,
      userRole: setup.userRole1,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [setup.payerKp, setup.signer1Kp],
      {
        commitment: "confirmed",
      }
    );

    const txLogs = await connection.getTransaction(sig, {
      commitment: "confirmed",
    });
    const innerIxs = txLogs.meta.innerInstructions[0].instructions;
    const events = rwaRbacClient.parseEvents(innerIxs);

    // Verify event logging.
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.name, "assignUserRoleEvent");
    assert.equal(event.data.role, "Role1");
    assert(event.data.roleId.eq(setup.roleId1));
    assert(event.data.sender.equals(setup.signer1));
    event.data.addresses.forEach((address, idx) => {
      assert(address.equals(usersToAssign[idx]));
    });

    // Verify userRole data
    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    const userRoleDataLenPost = (
      await connection.getAccountInfo(setup.userRole1)
    ).data.length;
    assert.equal(userRoleDataLenPost - userRoleDataLenPre, 96);
    assert.equal(userRoleAccount.users.length, 3);
    assert(userRoleAccount.users[0].equals(setup.signer2));
    assert(userRoleAccount.users[1].equals(setup.signer3));
    assert(userRoleAccount.users[2].equals(setup.payer));
  });

  it("Assign repeated users to UserRole 1 successfully with Admin", async () => {
    const userRoleDataLenPre = (
      await connection.getAccountInfo(setup.userRole1, "processed")
    ).data.length;

    // All users below are already assigned.
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [
        setup.signer3,
        setup.signer2,
        setup.payer,
        setup.signer3,
        setup.payer,
      ],
      userRole: setup.userRole1,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    const userRoleDataLenPost = (
      await connection.getAccountInfo(setup.userRole1)
    ).data.length;

    // No extra space allocated when users already exist.
    assert.equal(userRoleDataLenPost - userRoleDataLenPre, 0);

    // No change to user assignment list expected.
    assert.equal(userRoleAccount.users.length, 3);
    assert(userRoleAccount.users[0].equals(setup.signer2));
    assert(userRoleAccount.users[1].equals(setup.signer3));
    assert(userRoleAccount.users[2].equals(setup.payer));
  });

  it("Create UserRole 2 successfully with UserRole 1", async () => {
    const name = "Role2";
    const allowedAdminIxs = AdminFlags.NONE;
    const allowedMediciIxs = MediciFlags.NONE;

    const ix = await rwaRbacClient.createUserRoleIxn({
      payer: setup.payer,
      user: setup.signer2, // Non-Admin Key
      assetAccessController: setup.assetAccessController,
      name,
      allowedAdminIxs,
      allowedMediciIxs,
      authorizedUserRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer2Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);
    assert(
      userRoleAccount.assetAccessController.equals(setup.assetAccessController)
    );
    assert(userRoleAccount.id.eq(setup.roleId2));
    assert.equal(userRoleAccount.name, name);
    assert(userRoleAccount.allowedAdminIxs.eqn(allowedAdminIxs));
    assert(userRoleAccount.allowedMediciIxs.eqn(allowedMediciIxs));
    assert.equal(userRoleAccount.users.length, 0);

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(controllerAccount.userRolesCount.eqn(2));
  });

  it("Modify User Role 1 successfully with Admin", async () => {
    const name = ""; // Empty string is allowed.
    const allowedAdminIxs = computeFlags(
      AdminFlags.MODIFY_USER_ROLE,
      AdminFlags.CREATE_OR_DELETE_USER_ROLE,
      AdminFlags.ASSIGN_OR_REMOVE_CURRENT_ROLE,
      AdminFlags.WITHDRAW_EXCESS_RENT
    );
    const allowedMediciIxs = computeFlags(MediciFlags.ATTACH_TO_POLICY_ACCOUNT);

    const ix = await rwaRbacClient.modifyUserRoleIxn({
      name,
      allowedAdminIxs,
      allowedMediciIxs,
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    let userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert(
      userRoleAccount.assetAccessController.equals(setup.assetAccessController)
    );
    assert(userRoleAccount.id.eq(setup.roleId1));
    assert.equal(userRoleAccount.name, name);
    assert(userRoleAccount.allowedAdminIxs.eqn(allowedAdminIxs));
    assert(userRoleAccount.allowedMediciIxs.eqn(allowedMediciIxs));
    assert.equal(userRoleAccount.users.length, 3);

    const ix2 = await rwaRbacClient.modifyUserRoleIxn({
      name: "hello world",
      allowedAdminIxs,
      allowedMediciIxs,
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });

    // Check assignment of name
    await sendAndConfirmTransaction(connection, new Transaction().add(ix2), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    userRoleAccount = await rwaRbacClient.rbacProgram.account.userRole.fetch(
      setup.userRole1
    );
    assert.equal(userRoleAccount.name, "hello world");
  });

  it("Withdraw Excess Rent successfully with Admin", async () => {
    const ix = await rwaRbacClient.withdrawExcessRentIxn({
      receiver: setup.payer,
      admin: setup.signer1,
      controllerAuthority: setup.controllerAuthority,
      assetAccessController: setup.assetAccessController,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);
  });

  it("Withdraw Excess Rent successfully with role permission", async () => {
    const ix = await rwaRbacClient.withdrawExcessRentIxn({
      receiver: setup.payer,
      admin: setup.signer2,
      controllerAuthority: setup.controllerAuthority,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer2Kp,
    ]);
    //assert(false);
  });

  it("Fail to Modify User Role with Invalid Name length", async () => {
    try {
      // Test that error is thrown if name exceeds 64 chars.
      const ix = await rwaRbacClient.modifyUserRoleIxn({
        name: "x".repeat(65),
        allowedAdminIxs: AdminFlags.NONE,
        allowedMediciIxs: AdminFlags.NONE,
        user: setup.signer1, // Admin Key
        assetAccessController: setup.assetAccessController,
        userRole: setup.userRole1,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer1Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidName"));
    }

    try {
      // Test that error is thrown if name includes non-ascii chars.
      const ix = await rwaRbacClient.modifyUserRoleIxn({
        name: "😊🌍",
        allowedAdminIxs: AdminFlags.NONE,
        allowedMediciIxs: AdminFlags.NONE,
        user: setup.signer1, // Admin Key
        assetAccessController: setup.assetAccessController,
        userRole: setup.userRole1,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer1Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidName"));
    }
  });

  it("Assign user to same role succeeds with ASSIGN_OR_REMOVE_CURRENT_ROLE", async () => {
    const newUser = Keypair.generate();
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [newUser.publicKey],
      userRole: setup.userRole1,
      payer: setup.payer,
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });

    // Assignment of a new user to UserRole 1 is successful since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_CURRENT_ROLE flag.
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer2Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert.equal(userRoleAccount.users.length, 4);
    assert(userRoleAccount.users[3].equals(newUser.publicKey));
  });

  it("Assign user to different role fails with ASSIGN_OR_REMOVE_CURRENT_ROLE", async () => {
    const newUser = Keypair.generate();
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [newUser.publicKey],
      userRole: setup.userRole2,
      payer: setup.payer,
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });

    // Assignment of a new user to UserRole 2 fails since signer2 is
    // part of UserRole 1, which only has ASSIGN_OR_REMOVE_CURRENT_ROLE flag.
    try {
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer2Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidUserRole"));
    }
  });

  it("Assign user to different role succeeds with ASSIGN_OR_REMOVE_ANY_USER_ROLE", async () => {
    // Change UserRole1 to ASSIGN_OR_REMOVE_ANY_USER_ROLE flag.
    const ix1 = await rwaRbacClient.modifyUserRoleIxn({
      name: "",
      allowedAdminIxs: computeFlags(
        AdminFlags.MODIFY_USER_ROLE,
        AdminFlags.CREATE_OR_DELETE_USER_ROLE,
        AdminFlags.ASSIGN_OR_REMOVE_ANY_USER_ROLE
      ),
      allowedMediciIxs: computeFlags(MediciFlags.ATTACH_TO_POLICY_ACCOUNT),
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix1), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const newUser1 = Keypair.generate();
    const newUser2 = Keypair.generate();
    const ix2 = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [newUser1.publicKey, newUser2.publicKey],
      userRole: setup.userRole2,
      payer: setup.payer,
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });

    // Assignment of a new user to UserRole 2 succeeds since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_ANY_USER_ROLE flag.
    await sendAndConfirmTransaction(connection, new Transaction().add(ix2), [
      setup.payerKp,
      setup.signer2Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);
    assert.equal(userRoleAccount.users.length, 2);
    assert(userRoleAccount.users[0].equals(newUser1.publicKey));
    assert(userRoleAccount.users[1].equals(newUser2.publicKey));
  });
  
  
  it("Withdraw Excess Rent fails with wrong role permission", async () => {
    try {
      const ix = await rwaRbacClient.withdrawExcessRentIxn({
        receiver: setup.payer,
        admin: setup.signer2,
        controllerAuthority: setup.controllerAuthority,
        assetAccessController: setup.assetAccessController,
        authorizedUserRole: setup.userRole2,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer2Kp,
    ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidUserRole"));
    }
  });

  it("Assign user to different role succeeds with both assign flags", async () => {
    // Change UserRole1 to have both assign flags.
    const ix1 = await rwaRbacClient.modifyUserRoleIxn({
      name: "",
      allowedAdminIxs: computeFlags(
        AdminFlags.MODIFY_USER_ROLE,
        AdminFlags.CREATE_OR_DELETE_USER_ROLE,
        AdminFlags.ASSIGN_OR_REMOVE_CURRENT_ROLE,
        AdminFlags.ASSIGN_OR_REMOVE_ANY_USER_ROLE
      ),
      allowedMediciIxs: computeFlags(MediciFlags.ATTACH_TO_POLICY_ACCOUNT),
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix1), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const newUser1 = Keypair.generate();
    const newUser2 = Keypair.generate();
    const ix2 = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [newUser1.publicKey, newUser2.publicKey],
      userRole: setup.userRole2,
      payer: setup.payer,
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });

    // Assignment of a new user to UserRole 2 succeeds since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_ANY_USER_ROLE flag.
    await sendAndConfirmTransaction(connection, new Transaction().add(ix2), [
      setup.payerKp,
      setup.signer2Kp,
    ]);

    const userRoleAccountPost =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);
    assert.equal(userRoleAccountPost.users.length, 4);
    assert(userRoleAccountPost.users[2].equals(newUser1.publicKey));
    assert(userRoleAccountPost.users[3].equals(newUser2.publicKey));
  });

  it("Assign user to same role succeeds with both assign flags", async () => {
    const newUser = Keypair.generate();
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign: [newUser.publicKey],
      userRole: setup.userRole1,
      payer: setup.payer,
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      authorizedUserRole: setup.userRole1,
    });

    // Assignment of a new user to UserRole 1 succeeds since signer2 is
    // part of UserRole 1, which has both assign flags.
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer2Kp,
    ]);

    const userRoleAccountPost =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert.equal(userRoleAccountPost.users.length, 5);
    assert(userRoleAccountPost.users[4].equals(newUser.publicKey));
  });

  it("Remove user from different role succeeds with ASSIGN_OR_REMOVE_ANY_USER_ROLE", async () => {
    const userRoleAccountPre =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);

    const usersToRemove = [userRoleAccountPre.users[0]];
    const ix = await rwaRbacClient.removeUserRoleIxn({
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole2,
      authorizedUserRole: setup.userRole1,
      usersToRemove,
    });

    // Removal of a user from UserRole 2 succeeds since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_ANY_USER_ROLE flag.
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [setup.signer2Kp],
      {
        commitment: "confirmed",
      }
    );

    const txLogs = await connection.getTransaction(sig, {
      commitment: "confirmed",
    });
    const innerIxs = txLogs.meta.innerInstructions[0].instructions;
    const events = rwaRbacClient.parseEvents(innerIxs);

    // Verify event logging.
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.name, "removeUserRoleEvent");
    assert.equal(event.data.role, "Role2");
    assert(event.data.roleId.eq(setup.roleId2));
    assert(event.data.sender.equals(setup.signer2));
    event.data.addresses.forEach((address, idx) => {
      assert(address.equals(usersToRemove[idx]));
    });

    // Verify userRole
    const userRoleAccountPost =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);
    assert.equal(userRoleAccountPost.users.length, 3);
    assert(userRoleAccountPost.users[0].equals(userRoleAccountPre.users[1]));
    assert(userRoleAccountPost.users[1].equals(userRoleAccountPre.users[2]));
    assert(userRoleAccountPost.users[2].equals(userRoleAccountPre.users[3]));
  });

  it("Remove user from different role fails with ASSIGN_OR_REMOVE_CURRENT_ROLE", async () => {
    // Change UserRole1 to ASSIGN_OR_REMOVE_CURRENT_ROLE flag.
    const ix1 = await rwaRbacClient.modifyUserRoleIxn({
      name: "",
      allowedAdminIxs: computeFlags(
        AdminFlags.MODIFY_USER_ROLE,
        AdminFlags.CREATE_OR_DELETE_USER_ROLE,
        AdminFlags.ASSIGN_OR_REMOVE_CURRENT_ROLE
      ),
      allowedMediciIxs: computeFlags(MediciFlags.ATTACH_TO_POLICY_ACCOUNT),
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix1), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const userRoleAccountPre =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole2);
    const ix2 = await rwaRbacClient.removeUserRoleIxn({
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole2,
      authorizedUserRole: setup.userRole1,
      usersToRemove: [userRoleAccountPre.users[0]],
    });

    // Removal of a user from UserRole 2 fails since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_CURRENT_ROLE flag.
    try {
      await sendAndConfirmTransaction(connection, new Transaction().add(ix2), [
        setup.signer2Kp,
      ]);
      assert(false);
    } catch (err) {
      assert(err.toString().includes("InvalidUserRole"));
    }
  });

  it("Remove user from same role succeeds with ASSIGN_OR_REMOVE_CURRENT_ROLE", async () => {
    const userRoleAccountPre =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    const ix = await rwaRbacClient.removeUserRoleIxn({
      user: setup.signer2,
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
      authorizedUserRole: setup.userRole1,
      usersToRemove: [userRoleAccountPre.users[0]],
    });

    // Removal of a user from UserRole 1 succeeds since signer2 is
    // part of UserRole 1, which has ASSIGN_OR_REMOVE_CURRENT_ROLE flag.
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.signer2Kp,
    ]);

    const userRoleAccountPost =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert.equal(userRoleAccountPost.users.length, 4);
  });

  it("Remove users from UserRole 1 successfully with Admin", async () => {
    const ix = await rwaRbacClient.removeUserRoleIxn({
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
      usersToRemove: [setup.payer, setup.signer3],
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.signer1Kp,
    ]);

    let userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole1);
    assert.equal(userRoleAccount.users.length, 2);

    // Removing same users again doesn't result in change in state.
    const ix2 = await rwaRbacClient.removeUserRoleIxn({
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
      usersToRemove: [setup.payer, setup.signer3, setup.payer],
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix2), [
      setup.signer1Kp,
    ]);

    userRoleAccount = await rwaRbacClient.rbacProgram.account.userRole.fetch(
      setup.userRole1
    );
    assert.equal(userRoleAccount.users.length, 2);
  });

  it("Delete User Role 1 successfully with Admin", async () => {
    const preBalance = await connection.getBalance(setup.payer);
    const ix = await rwaRbacClient.deleteUserRoleIxn({
      receiver: setup.payer,
      user: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      userRole: setup.userRole1,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.provider.connection.getAccountInfo(setup.userRole1);
    assert.isNull(userRoleAccount);

    // Check that rent is refunded to receiver.
    const postBalance = await connection.getBalance(setup.payer);
    assert(postBalance - preBalance > 0);
  });

  it("Create Master role successfully", async () => {
    const name = "Master";
    const allowedAdminIxs = AdminFlags.ALL;
    const allowedMediciIxs = MediciFlags.ALL;

    const ix = await rwaRbacClient.createUserRoleIxn({
      name,
      allowedAdminIxs,
      allowedMediciIxs,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
      isMasterRole: true,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.payerKp,
      setup.signer1Kp,
    ]);

    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole3);
    assert(
      userRoleAccount.assetAccessController.equals(setup.assetAccessController)
    );
    assert(userRoleAccount.id.eq(setup.roleId3));
    assert.equal(userRoleAccount.name, name);

    assert(userRoleAccount.allowedAdminIxs.toNumber() === allowedAdminIxs);
    assert(userRoleAccount.allowedMediciIxs.toNumber() === allowedMediciIxs);
    assert(userRoleAccount.isMasterRole);
    assert.equal(userRoleAccount.users.length, 0);

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(!controllerAccount.hasMasterRole);
  });

  it("Fail to void authority", async () => {
    try {
      const ix = await rwaRbacClient.updateControllerAdminIxn({
        admin: setup.signer1, // Admin Key
        assetAccessController: setup.assetAccessController,
        newAdmin: SystemProgram.programId,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.signer1Kp,
      ]);

      assert(false);
    } catch (err) {
      assert(err.toString().includes("CannotVoidAuthority"));
    }
  });

  it("Assign users to master role successfully with Admin", async () => {
    const usersToAssign = [setup.signer2];
    const ix = await rwaRbacClient.assignUserRoleIxn({
      usersToAssign,
      userRole: setup.userRole3,
      payer: setup.payer,
      user: setup.signer1,
      assetAccessController: setup.assetAccessController,
    });
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [setup.payerKp, setup.signer1Kp],
      {
        commitment: "confirmed",
      }
    );

    // Verify userRole data
    const userRoleAccount =
      await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole3);
    assert.equal(userRoleAccount.users.length, 1);
    assert(userRoleAccount.users[0].equals(setup.signer2));

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController
      );
    assert(controllerAccount.hasMasterRole);
  });

  it("Fails to remove last user from master role", async () => {
    try {
      const userRoleAccountPre =
        await rwaRbacClient.rbacProgram.account.userRole.fetch(setup.userRole3);

      const usersToRemove = [userRoleAccountPre.users[0]];
      const ix = await rwaRbacClient.removeUserRoleIxn({
        user: setup.signer1,
        assetAccessController: setup.assetAccessController,
        userRole: setup.userRole3,
        authorizedUserRole: setup.userRole3,
        usersToRemove,
      });

      await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [setup.signer1Kp],
        {
          commitment: "confirmed",
        }
      );
      assert(false);
    } catch (err) {
      assert(err.toString().includes("CannotEmptyMasterRole"));
    }
  });

  it("Fail to delete master role", async () => {
    try {
      const ix = await rwaRbacClient.deleteUserRoleIxn({
        receiver: setup.payer,
        user: setup.signer1, // Admin Key
        assetAccessController: setup.assetAccessController,
        userRole: setup.userRole3,
      });
      await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
        setup.payerKp,
        setup.signer1Kp,
      ]);

      assert(false);
    } catch (err) {
      assert(err.toString().includes("CannotDeleteMasterRole"));
    }
  });

  it("Update Controller Admin successfully", async () => {
    const ix = await rwaRbacClient.updateControllerAdminIxn({
      admin: setup.signer1, // Admin Key
      assetAccessController: setup.assetAccessController,
      newAdmin: setup.signer2,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.signer1Kp,
    ]);

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController,
        "processed"
      );
    assert(
      controllerAccount.controllerAuthority.equals(setup.controllerAuthority)
    );
    assert.equal(
      controllerAccount.controllerAuthorityBump,
      setup.controllerAuthorityBump
    );
    assert(controllerAccount.admin.equals(setup.signer2));
    assert(controllerAccount.assetMint.equals(setup.assetMint));
    assert(controllerAccount.userRolesCount.eqn(3));
  });

  it("Void Controller Admin successfully", async () => {
    const ix = await rwaRbacClient.updateControllerAdminIxn({
      admin: setup.signer2, // Admin Key
      assetAccessController: setup.assetAccessController,
      newAdmin: SystemProgram.programId,
    });
    await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
      setup.signer2Kp,
    ]);

    const controllerAccount =
      await rwaRbacClient.rbacProgram.account.assetAccessController.fetch(
        setup.assetAccessController,
        "processed"
      );
    assert(controllerAccount.admin.equals(SystemProgram.programId));
  });
});
