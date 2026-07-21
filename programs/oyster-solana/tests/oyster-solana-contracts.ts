import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarketV } from "../target/types/market_v";
import { createAssociatedTokenAccount, createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert, expect } from "chai";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Clock, start } from "solana-bankrun";
import { OysterCredits } from "../target/types/oyster_credits";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
// import { OysterSolanaContracts } from "../target/types/oyster_solana_contracts";

function get_seeds(seed_str: any): any {
    return [...seed_str].map((char) => char.codePointAt());
}

describe("market_v1", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // add test to initialize the MarketV program
    const program = anchor.workspace.MarketV as Program<MarketV>;
    const authority = provider.wallet.publicKey;
    // (provider.wallet as anchor.Wallet).payer

    let tokenMint: PublicKey;
    let waitTime = new anchor.BN(60);

    // let tokenMint;
    before(async () => {
        // Create a mock USDC mint
        tokenMint = await createMint(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            authority,
            null,
            6 // USDC typically has 6 decimal places
        );
    })

    it("can initialize", async () => {
        const RATE_LOCK_SELECTOR = "RATE_LOCK";
        const tx = await program.methods.initialize(
            RATE_LOCK_SELECTOR,
            waitTime,
            authority,
        ).accounts({
            admin: authority,
            tokenMint,
        }).rpc();
        console.log("Your transaction signature", tx);

        let marketAccount: PublicKey;
        [marketAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("market")],
            program.programId
        );
        // check the market account
        let marketData = await program.account.market.fetch(marketAccount);

        expect(marketData.admin.toBase58()).to.equal(authority.toBase58());
        expect(marketData.jobIndex.toString()).to.equal(new anchor.BN(0).toString());
        expect(marketData.tokenMint.toBase58()).to.equal(tokenMint.toBase58());
    });
});

describe("market_v1 - add provider", () => {
    let providerAccount: PublicKey;
    let program: Program<MarketV>;
    let authority: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        // add test to initialize the MarketV program
        program = anchor.workspace.MarketV as Program<MarketV>;
        authority = provider.wallet.publicKey;
        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            program.programId
        );
        console.log("providerAccount", providerAccount.toBase58());
    })

    it("can add provider", async () => {
        let cp = "https://example.com/";
        await program.methods.providerAdd(
            cp
        ).accountsStrict({
            provider: providerAccount,
            authority,
            systemProgram: SystemProgram.programId,
        }).rpc();

        const provider = await program.account.provider.fetch(providerAccount);

        expect(provider.cp).to.equal(cp);
    });

    it("cannot add provider with empty cp", async () => {
        let cp = "";
        // check for fail transaction
        try {
            await program.methods.providerAdd(
                cp
            ).accountsStrict({
                provider: providerAccount,
                authority,
                systemProgram: SystemProgram.programId,
            }).signers([]).rpc();
        } catch (error) {
            console.log("error: ", error?.error);
            expect((error as anchor.AnchorError).message).to.be.an('ProviderAlreadyExists');
        }
    });

});

describe("market_v1 - remove provider", () => {
    let providerAccount: PublicKey;
    let program: Program<MarketV>;
    let authority: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        // add test to initialize the MarketV program
        program = anchor.workspace.MarketV as Program<MarketV>;
        authority = provider.wallet.publicKey;
        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            program.programId
        );
        console.log("providerAccount", providerAccount.toBase58());

        let cp = "https://example.com/";
        await program.methods.providerAdd(
            cp
        ).accountsStrict({
            provider: providerAccount,
            authority,
            systemProgram: SystemProgram.programId,
        }).rpc();
    })

    it("can remove provider", async () => {
        await program.methods.providerRemove().accountsStrict({
            provider: providerAccount,
            authority,
            // systemProgram: SystemProgram.programId,
        }).rpc();

        // verify that the provider is removed
        try {
            await program.account.provider.fetch(providerAccount);
            assert.fail("The provider account should have been deleted");
        } catch (error) {
            expect(error.message).to.include("Account does not exist");
        }
    });

    it("cannot remove provider if not the authority", async () => {
        // Create a new provider account
        // let providerAccount1: PublicKey;
        // [providerAccount1,] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("provider"), authority.toBuffer()],
        //     program.programId
        // );

        // check for fail transaction
        await program.methods.providerRemove().accounts({
            // provider: providerAccount1,
            authority,
            // systemProgram: SystemProgram.programId,
        }).rpc();
        // try {
        //     await program.methods.providerRemove().accounts({
        //         // provider: providerAccount1,
        //         authority,
        //         // systemProgram: SystemProgram.programId,
        //     }).rpc();
        // } catch (error) {
        //     console.log("error: ", error?.error);
        //     expect((error as anchor.AnchorError).message).to.be.an('ProviderDoesNotExist');
        // }
    });

});

describe("market_v1 - update provider", () => {
    let providerAccount: PublicKey;
    let program: Program<MarketV>;
    let authority: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        // add test to initialize the MarketV program
        program = anchor.workspace.MarketV as Program<MarketV>;
        authority = provider.wallet.publicKey;
        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            program.programId
        );
        console.log("providerAccount", providerAccount.toBase58());

        let cp = "https://example.com/";
        await program.methods.providerAdd(
            cp
        ).accountsStrict({
            provider: providerAccount,
            authority,
            systemProgram: SystemProgram.programId,
        }).rpc();
    });

    it("can update cp", async () => {
        let newCp = "https://new-example.com/";
        await program.methods.providerUpdateWithCp(newCp)
            .accounts({
                authority
            })
            .rpc();

        const provider = await program.account.provider.fetch(providerAccount);
        expect(provider.cp).to.equal(newCp);
    });
});

describe("market_v1 - job open", () => {
    let provider: anchor.AnchorProvider;
    let providerAccount: PublicKey;
    let credits_program: Program<OysterCredits>;
    let market_program: Program<MarketV>;
    let authority: PublicKey;
    let tokenMint: PublicKey;
    let authorityTokenAccount: PublicKey;
    let creditMint: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        credits_program = anchor.workspace.OysterCredits as Program<OysterCredits>;
        // add test to initialize the MarketV program
        market_program = anchor.workspace.MarketV as Program<MarketV>;
        authority = provider.wallet.publicKey;

        // Create a mock USDC mint
        tokenMint = await createMint(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            authority,
            null,
            6 // USDC typically has 6 decimal places
        );

        // get token account of the owner
        authorityTokenAccount = await createAssociatedTokenAccount(
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

        [creditMint,] = PublicKey.findProgramAddressSync(
            [Buffer.from("credit_mint")],
            credits_program.programId
        );

        // initialize the MarketV program
        let noticePeriod = new anchor.BN(60);
        await market_program.methods.initialize(
            authority,
            noticePeriod,
            credits_program.programId,
            creditMint
        ).accounts({
            admin: authority,
            tokenMint,
        }).rpc();

        // initialize credits program
        await credits_program.methods.initialize(
            authority,
            market_program.programId,
            tokenMint,
        ).rpc();

        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            market_program.programId
        );

        // add provider
        let cp = "https://example.com/";
        await market_program.methods.providerAdd(
            cp
        ).accounts({
            authority,
        }).rpc();
    });

    it("can open job", async () => {
        const ownerTokenAccountDataInitial = await market_program.provider.connection.getTokenAccountBalance(authorityTokenAccount);

        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        // let jobIndex = new anchor.BN(0);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            market_program.programId
        );

        // get token account of the owner
        let userCreditTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            creditMint,
            authority
        );

        let stateAccount: PublicKey;
        [stateAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("state")],
            credits_program.programId
        );

        let creditProgramUsdcTokenAccount: PublicKey;
        [creditProgramUsdcTokenAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_usdc"), tokenMint.toBuffer()],
            credits_program.programId
        );

        let metadata = "metadata example",
            prov = authority,
            rate = new anchor.BN(10),
            balance = new anchor.BN(100).mul(new anchor.BN(10 ** 6));

        await market_program.methods.jobOpen(
            metadata,
            prov,
            rate,
            balance
        ).accounts({
            tokenMint,
            userTokenAccount: authorityTokenAccount,
            providerTokenAccount: authorityTokenAccount,
            creditMint,
            userCreditTokenAccount,
            state: stateAccount,
            creditProgramUsdcTokenAccount
        }).rpc();

        const jobData = await market_program.account.job.fetch(jobAccount);
        console.log("jobData: ", jobData);

        expect(jobData.index.eq(jobIndex)).to.be.true;
        expect(jobData.metadata).to.equal(metadata);
        expect(jobData.provider.toBase58()).to.equal(prov.toBase58());
        expect(jobData.rate.eq(rate)).to.be.true;
        // expect(jobData.balance.eq(balance)).to.be.true;

        // // check mint token balance of owner
        // const ownerTokenAccountDataFinal = await market_program.provider.connection.getTokenAccountBalance(authorityTokenAccount);
        // expect(new anchor.BN(ownerTokenAccountDataInitial.value.amount)
        //         .sub(new anchor.BN(ownerTokenAccountDataFinal.value.amount)).toString())
        //     .to.eq(balance.toString());

        // // check mint token balance of job token account
        // let jobTokenAddress: PublicKey;
        // [jobTokenAddress,] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("job_token"), tokenMint.toBuffer()],
        //     market_program.programId
        // );
        // const jobTokenAccountData = await market_program.provider.connection.getTokenAccountBalance(jobTokenAddress);
        // expect(jobTokenAccountData.value.amount).to.eq(balance.toString());
    });
});

describe("market_v1 - job settle", () => {
    let provider: anchor.AnchorProvider;
    // let provider: BankrunProvider;
    let providerAccount: PublicKey;
    let market_program: Program<MarketV>;
    let credits_program: Program<OysterCredits>;
    let authority: PublicKey;
    let tokenMint: PublicKey;
    let providerTokenAccount: PublicKey;
    let creditMint: PublicKey;
    let stateAccount: PublicKey;
    let creditProgramUsdcTokenAccount: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        provider = anchor.AnchorProvider.env();
        // const context = await startAnchor(".", [], []);
        // provider = new BankrunProvider(context);
        anchor.setProvider(provider);

        // add test to initialize the MarketV program
        market_program = anchor.workspace.MarketV as Program<MarketV>;
        credits_program = anchor.workspace.OysterCredits as Program<OysterCredits>;

        authority = provider.wallet.publicKey;

        // Create a mock USDC mint
        tokenMint = await createMint(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            authority,
            null,
            6 // USDC typically has 6 decimal places
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

        // initialize the MarketV program
        let noticePeriod = new anchor.BN(60);
        await market_program.methods.initialize(
            authority,
            noticePeriod
        ).accounts({
            admin: authority,
            tokenMint,
        }).rpc();

        // initialize credits program
        await credits_program.methods.initialize(
            authority,
            market_program.programId,
            tokenMint,
        ).rpc();

        // [providerAccount,] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("provider"), authority.toBuffer()],
        //     program.programId
        // );
        // generate random wallet for provider
        const providerWallet = Keypair.generate();
        providerAccount = providerWallet.publicKey;
        // get token account of the provider
        providerTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            tokenMint,
            providerAccount
        );
        console.log("HERE5");

        // add provider
        let cp = "https://example.com/";
        await market_program.methods.providerAdd(
            cp
        ).accounts({
            authority,
        }).rpc();

        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            market_program.programId
        );

        [creditMint,] = PublicKey.findProgramAddressSync(
            [Buffer.from("credit_mint")],
            credits_program.programId
        );

        // get token account of the owner
        let userCreditTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            creditMint,
            authority
        );

        [stateAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("state")],
            credits_program.programId
        );

        [creditProgramUsdcTokenAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_usdc"), tokenMint.toBuffer()],
            credits_program.programId
        );

        let metadata = "metadata example",
            rate = new anchor.BN(5 * 10 ** 12),
            balance = new anchor.BN(100).mul(new anchor.BN(10 ** 6));

        await market_program.methods.jobOpen(
            metadata,
            providerAccount,
            rate,
            balance
        ).accounts({
            tokenMint,
            userTokenAccount: authorityTokenAccount,
            providerTokenAccount,
            creditMint,
            userCreditTokenAccount,
            state: stateAccount,
            creditProgramUsdcTokenAccount
        }).rpc();
        console.log("HERE6");
    });

    it("can settle job", async () => {
        // const ownerTokenAccountDataInitial = await program.provider.connection.getTokenAccountBalance(authorityTokenAccount);

        // Log the current blockchain time
        // let slot = await market_program.provider.connection.getSlot();
        // let blockTime = await market_program.provider.connection.getBlockTime(slot);
        // console.log("Current blockchain time1:", slot, new Date(blockTime * 1000).toISOString());
        // console.log("time: ", await provider.connection.getLatestBlockhashAndContext());

        // const context = await startAnchor(".", [], []);
        // let bankrunProvider = new BankrunProvider(context);
        // anchor.setProvider(bankrunProvider);
        // await bankrunProvider.context.warpToEpoch(BigInt(20000));
        // console.log("ProgramId: ", program.programId );
        // const context = await start(
        //     [{ name: "market_v", programId: market_program.programId }],
        //     [],
        // );
        // const currentClock = await context.banksClient.getClock();
        // context.setClock(
        //     new Clock(
        //         currentClock.slot,
        //         currentClock.epochStartTimestamp,
        //         currentClock.epoch,
        //         currentClock.leaderScheduleEpoch,
        //         BigInt(50),
        //     ),
        // )

        // slot = await program.provider.connection.getSlot();
        // blockTime = await program.provider.connection.getBlockTime(slot);
        // console.log("Current blockchain time2:", slot, new Date(blockTime * 1000).toISOString());
        // console.log("DONE");
        
        // settle job
        
        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            market_program.programId
        );

        console.log("time1: ", Date.now());
        // Wait for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log("time2: ", Date.now());

        // execute the settle job
        let txn = await market_program.methods.jobSettle(jobIndex)
            .accounts({
                tokenMint,
                providerTokenAccount,
                creditMint,
                state: stateAccount,
                creditProgramUsdcTokenAccount
            }).rpc({commitment: 'confirmed'});

        // get txn timestamp
        let txnReceipt = await market_program.provider.connection.getParsedTransaction(txn, {commitment: 'confirmed'});
        let txnTimestamp = new anchor.BN(txnReceipt.blockTime);

        const jobData = await market_program.account.job.fetch(jobAccount);
        let amount = (jobData.rate.mul(txnTimestamp
                                .sub(jobData.lastSettled)
                                .add(new anchor.BN(10 ** 12 - 1))))
                                .div(new anchor.BN(10 ** 12));

        expect(jobData.index.eq(jobIndex)).to.be.true;
        // expect(jobData.provider.toBase58()).to.equal(provider.toBase58());
        // expect(jobData.rate.eq(rate)).to.be.true;
        console.log("data: ", jobData.balance.toNumber(), new anchor.BN(100).sub(amount).toNumber());
        // expect(jobData.balance).to.eq(new anchor.BN(100).sub(amount));

        // // check mint token balance of owner
        // const ownerTokenAccountDataFinal = await program.provider.connection.getTokenAccountBalance(authorityTokenAccount);
        // expect(new anchor.BN(ownerTokenAccountDataInitial.value.amount)
        //         .sub(new anchor.BN(ownerTokenAccountDataFinal.value.amount)).toString())
        //     .to.eq(balance.toString());

        // // check mint token balance of job token account
        // let jobTokenAddress: PublicKey;
        // [jobTokenAddress,] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("job_token"), tokenMint.toBuffer()],
        //     program.programId
        // );
        // const jobTokenAccountData = await program.provider.connection.getTokenAccountBalance(jobTokenAddress);
        // expect(jobTokenAccountData.value.amount).to.eq(balance.toString());
    });
});

describe("market_v1 - job close", () => {
    let providerAccount: PublicKey;
    let credits_program: Program<OysterCredits>;
    let market_program: Program<MarketV>;
    let authority: PublicKey;
    let tokenMint: PublicKey;
    let authorityTokenAccount: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        // add test to initialize the MarketV program
        market_program = anchor.workspace.MarketV as Program<MarketV>;
        credits_program = anchor.workspace.OysterCredits as Program<OysterCredits>;
        authority = provider.wallet.publicKey;

        // Create a mock USDC mint
        tokenMint = await createMint(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            authority,
            null,
            6 // USDC typically has 6 decimal places
        );

        // get token account of the owner
        authorityTokenAccount = await createAssociatedTokenAccount(
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

        const RATE_LOCK_SELECTOR = "RATE_LOCK";

        // initialize the MarketV program
        let waitTime = new anchor.BN(60);
        await program.methods.initialize(
            RATE_LOCK_SELECTOR,
            waitTime,
            authority,
        ).accounts({
            admin: authority,
            tokenMint,
        }).rpc();

        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            program.programId
        );

        // add provider
        let cp = "https://example.com/";
        await program.methods.providerAdd(
            cp
        ).accounts({
            authority,
        }).rpc();

        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            program.programId
        );
        let metadata = "metadata example",
            rate = new anchor.BN(5 * 10 ** 12),
            balance = new anchor.BN(100);

        await program.methods.jobOpen(
            metadata,
            providerAccount,
            rate,
            balance
        ).accounts({
            job: jobAccount,
            tokenMint,
            ownerTokenAccount: authorityTokenAccount,
        }).rpc();
    });

    it("can close job", async () => {
        const ownerTokenAccountDataInitial = await program.provider.connection.getTokenAccountBalance(authorityTokenAccount);

        // settle job
        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            program.programId
        );
        // execute the settle job
        let txn = await program.methods.jobSettle(jobIndex)
            .accounts({
                tokenMint,
                providerTokenAccount: authorityTokenAccount,
            }).rpc({commitment: 'confirmed'});

        // get txn timestamp
        let txnReceipt = await program.provider.connection.getParsedTransaction(txn, {commitment: 'confirmed'});
        let txnTimestamp = new anchor.BN(txnReceipt.blockTime);

        const jobData = await program.account.job.fetch(jobAccount);
        let amount = (jobData.rate.mul(txnTimestamp
                                .sub(jobData.lastSettled)
                                .add(new anchor.BN(10 ** 12 - 1))))
                                .div(new anchor.BN(10 ** 12));

        expect(jobData.index.eq(jobIndex)).to.be.true;
        // expect(jobData.provider.toBase58()).to.equal(provider.toBase58());
        // expect(jobData.rate.eq(rate)).to.be.true;
        console.log("data: ", jobData.balance.toNumber(), new anchor.BN(100).sub(amount).toNumber());
        // expect(jobData.balance).to.eq(new anchor.BN(100).sub(amount));

        // // check mint token balance of owner
        // const ownerTokenAccountDataFinal = await program.provider.connection.getTokenAccountBalance(authorityTokenAccount);
        // expect(new anchor.BN(ownerTokenAccountDataInitial.value.amount)
        //         .sub(new anchor.BN(ownerTokenAccountDataFinal.value.amount)).toString())
        //     .to.eq(balance.toString());

        // // check mint token balance of job token account
        // let jobTokenAddress: PublicKey;
        // [jobTokenAddress,] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("job_token"), tokenMint.toBuffer()],
        //     program.programId
        // );
        // const jobTokenAccountData = await program.provider.connection.getTokenAccountBalance(jobTokenAddress);
        // expect(jobTokenAccountData.value.amount).to.eq(balance.toString());
    });
});

describe.only("market_v1 - update job metadata", () => {
    let provider: anchor.AnchorProvider;
    let providerAccount: PublicKey;
    let credits_program: Program<OysterCredits>;
    let market_program: Program<MarketV>;
    let authority: PublicKey;
    let tokenMint: PublicKey;
    let authorityTokenAccount: PublicKey;
    let creditMint: PublicKey;

    before(async () => {
        // Configure the client to use the local cluster.
        provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);

        credits_program = anchor.workspace.OysterCredits as Program<OysterCredits>;
        // add test to initialize the MarketV program
        market_program = anchor.workspace.MarketV as Program<MarketV>;
        authority = provider.wallet.publicKey;

        // Create a mock USDC mint
        tokenMint = await createMint(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            authority,
            null,
            6 // USDC typically has 6 decimal places
        );

        // get token account of the owner
        authorityTokenAccount = await createAssociatedTokenAccount(
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

        [creditMint,] = PublicKey.findProgramAddressSync(
            [Buffer.from("credit_mint")],
            credits_program.programId
        );

        // initialize the MarketV program
        let noticePeriod = new anchor.BN(60);
        await market_program.methods.initialize(
            authority,
            noticePeriod,
            credits_program.programId,
            creditMint
        ).accounts({
            admin: authority,
            tokenMint,
        }).rpc();

        // initialize credits program
        await credits_program.methods.initialize(
            authority,
            market_program.programId,
            tokenMint,
        ).rpc();

        [providerAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), authority.toBuffer()],
            market_program.programId
        );

        // add provider
        let cp = "https://example.com/";
        await market_program.methods.providerAdd(
            cp
        ).accounts({
            authority,
        }).rpc();

        // OPEN JOB
        // get token account of the owner
        let userCreditTokenAccount = await createAssociatedTokenAccount(
            provider.connection,
            (provider.wallet as anchor.Wallet).payer,
            creditMint,
            authority
        );

        let stateAccount: PublicKey;
        [stateAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("state")],
            credits_program.programId
        );

        let creditProgramUsdcTokenAccount: PublicKey;
        [creditProgramUsdcTokenAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("program_usdc"), tokenMint.toBuffer()],
            credits_program.programId
        );

        let metadata = "metadata example",
            prov = authority,
            rate = new anchor.BN(10),
            balance = new anchor.BN(100).mul(new anchor.BN(10 ** 6));

        await market_program.methods.jobOpen(
            metadata,
            prov,
            rate,
            balance
        ).accounts({
            tokenMint,
            userTokenAccount: authorityTokenAccount,
            providerTokenAccount: authorityTokenAccount,
            creditMint,
            userCreditTokenAccount,
            state: stateAccount,
            creditProgramUsdcTokenAccount
        }).rpc();
    });

    it("can update job metadata", async () => {
        // First 64 bits as max u64, second 64 bits as 0 ((2^64 - 1) << 64)
        let jobIndex = new anchor.BN(2).pow(new anchor.BN(64)).sub(new anchor.BN(1)).shln(64);
        // let jobIndex = new anchor.BN(0);
        let jobAccount: PublicKey;
        [jobAccount,] = PublicKey.findProgramAddressSync(
            [Buffer.from("job"), Buffer.from(jobIndex.toArray('le', 16))],
            market_program.programId
        );

        let newMetadata = "https://new-example.com/";
        await market_program.methods.jobMetadataUpdate(
            jobIndex,
            newMetadata
        ).rpc();

        const jobData = await market_program.account.job.fetch(jobAccount);
        expect(jobData.metadata).to.equal(newMetadata);
    });
});