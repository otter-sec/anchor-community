import { BN, getProvider } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  deriveAssetAccessControllerPda,
  deriveUserRolePda,
  RBAC_PROGRAM,
} from "../client/src";
import { Config } from "@dstoken-solana/rwa-token-sdk";
import { readFileSync } from "fs";

export async function setupTests() {
  const keypairData = new Uint8Array(
    JSON.parse(readFileSync("tests/testSigner.json", "utf-8"))
  );
  const signer1Kp = Keypair.fromSecretKey(keypairData);
  const signer2Kp = new Keypair();
  const signer3Kp = new Keypair();
  const payerKp = new Keypair();
  const user1Kp = new Keypair();
  const user2Kp = new Keypair();
  const user3Kp = new Keypair();
  const provider = getProvider();

  // airdrop to all users
  const txns = await Promise.all([
    provider.connection.requestAirdrop(payerKp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(signer1Kp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(signer2Kp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(signer3Kp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(user1Kp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(user2Kp.publicKey, LAMPORTS_PER_SOL),
    provider.connection.requestAirdrop(user3Kp.publicKey, LAMPORTS_PER_SOL),
  ]);

  await Promise.all(
    txns.map((txn) => provider.connection.confirmTransaction(txn, "finalized"))
  );

  const assetMintKp = Keypair.generate();
  const assetMint = assetMintKp.publicKey;
  const controller = deriveAssetAccessControllerPda(assetMint);
  const roleId1 = new BN(1);
  const roleId2 = new BN(2);
  const roleId3 = new BN(3);
  const userRole1 = deriveUserRolePda(roleId1, controller);
  const userRole2 = deriveUserRolePda(roleId2, controller);
  const userRole3 = deriveUserRolePda(roleId3, controller);

  const [controllerAuthority, controllerAuthorityBump] =
    PublicKey.findProgramAddressSync([controller.toBuffer()], RBAC_PROGRAM);

  const connectionUrl = process.env.RPC_URL ?? "http://localhost:8899";
  const connection = new Connection(connectionUrl, "processed");
  const config: Config = {
    connection,
    rpcUrl: connectionUrl,
    confirmationOptions: {
      skipPreflight: false,
      maxRetries: 3,
      commitment: "processed",
    },
  };

  return {
    config,
    payerKp,
    payer: payerKp.publicKey,
    signer1Kp,
    signer1: signer1Kp.publicKey,
    signer2Kp,
    signer2: signer2Kp.publicKey,
    signer3Kp,
    signer3: signer3Kp.publicKey,
    provider,
    user1Kp,
    user1: user1Kp.publicKey,
    user2Kp,
    user2: user2Kp.publicKey,
    user3Kp,
    user3: user3Kp.publicKey,
    assetMint,
    assetMintKp,
    assetAccessController: controller,
    controllerAuthority,
    controllerAuthorityBump,
    roleId1,
    roleId2,
    roleId3,
    userRole1,
    userRole2,
    userRole3,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
