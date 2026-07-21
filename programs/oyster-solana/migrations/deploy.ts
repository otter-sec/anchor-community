// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { Program } from "@coral-xyz/anchor";
import { MarketV } from "../target/types/market_v";
import { OysterCredits } from "../target/types/oyster_credits";
import { createAssociatedTokenAccount, createMint, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

// const anchor = require("@coral-xyz/anchor");
import * as anchor from "@coral-xyz/anchor";

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
  const marketVProgram = anchor.workspace.MarketV as Program<MarketV>;
  console.log("marketVProgram", marketVProgram.programId.toBase58());
  const oysterCreditProgram = anchor.workspace.OysterCredits as Program<OysterCredits>;
  console.log("oysterCreditProgram", oysterCreditProgram.programId.toBase58());
  let authority = provider.wallet.publicKey;
  console.log("authority", authority.toBase58(), provider.connection);

  // Create a mock USDC mint
  let tokenMint = await createMint(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    authority,
    null,
    6, // USDC typically has 6 decimal places
    undefined,
    {preflightCommitment: 'confirmed'}
  );

  // get token account of the owner
  let authorityTokenAccount = await createAssociatedTokenAccount(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tokenMint,
    authority
  );

  // mint tokens to owner
  await mintTo(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    tokenMint,
    authorityTokenAccount,
    authority,
    10 ** 8 // Amount of tokens to mint (in smallest unit, e.g., 1 USDC = 1,000,000 micro USDC)
  );

  let creditMint: PublicKey;
  [creditMint,] = PublicKey.findProgramAddressSync(
    [Buffer.from("credit_mint")],
    oysterCreditProgram.programId
  );

  // initialize the MarketV program
  let noticePeriod = new anchor.BN(60);
  await marketVProgram.methods.initialize(
    authority,
    noticePeriod,
    oysterCreditProgram.programId,
    creditMint
  ).accounts({
    admin: authority,
    tokenMint,
  }).rpc();

  // initialize credits program
  await oysterCreditProgram.methods.initialize(
    authority,
    marketVProgram.programId,
    tokenMint,
  ).rpc();

  console.log("MarketV and OysterCredit programs deployed and initialized successfully.");
};
