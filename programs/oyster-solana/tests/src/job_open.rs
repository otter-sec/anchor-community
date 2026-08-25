use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_program_test::*;
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use oyster_solana_contracts::program::MarketV;
use oyster_credits::program::OysterCredits;

#[test]
fn test_initialize() {
    let program_id = "DsrQF225MCwBNwKr4DiGFugyE9kwZ73wSPB2utjbvNUe";
    let anchor_wallet = std::env::var("ANCHOR_WALLET").unwrap();
    let payer = read_keypair_file(&anchor_wallet).unwrap();
    println!("payer: {:?} {:?}", anchor_wallet, payer.pubkey());

    let client = Client::new_with_options(Cluster::Localnet, &payer, CommitmentConfig::confirmed());
    let program_id = Pubkey::from_str(program_id).unwrap();
    let program = client.program(program_id).unwrap();

    // let tx = program
    //     .request()
    //     .accounts(anchor_rust::accounts::Initialize {})
    //     .args(anchor_rust::instruction::Initialize {})
    //     .send()
    //     .expect("");

    // println!("Your transaction signature {}", tx);
}

// #[test]
// async fn test_job_open() {
//     // Initialize the test environment
//     let program_test = ProgramTest::new("oyster_solana_contracts", MarketV::id(), processor!(MarketV::entry));
//     let mut context = program_test.start_with_context().await;

//     // Define key accounts
//     let payer = &context.payer;
//     let authority = payer.pubkey();
//     println!("Authority: {:?}", authority);
//     println!("Payer: {:?}", payer.pubkey());
//     return;

//     // Create a mock USDC mint
//     let token_mint = Keypair::new();
//     let token_mint_pubkey = token_mint.pubkey();
//     let rent = context.banks_client.get_rent().await.unwrap();
//     let mint_rent = rent.minimum_balance(Mint::LEN);

//     let create_mint_ix = solana_sdk::system_instruction::create_account(
//         &payer.pubkey(),
//         &token_mint_pubkey,
//         mint_rent,
//         Mint::LEN as u64,
//         &spl_token::id(),
//     );

//     let init_mint_ix = spl_token::instruction::initialize_mint(
//         &spl_token::id(),
//         &token_mint_pubkey,
//         &authority,
//         None,
//         6, // USDC typically has 6 decimal places
//     )
//     .unwrap();

//     let tx = Transaction::new_signed_with_payer(
//         &[create_mint_ix, init_mint_ix],
//         Some(&payer.pubkey()),
//         &[payer, &token_mint],
//         context.last_blockhash,
//     );

//     context.banks_client.process_transaction(tx).await.unwrap();

//     // Create an associated token account for the authority
//     let authority_token_account = Keypair::new();
//     let authority_token_account_pubkey = authority_token_account.pubkey();

//     let create_token_account_ix = solana_sdk::system_instruction::create_account(
//         &payer.pubkey(),
//         &authority_token_account_pubkey,
//         rent.minimum_balance(TokenAccount::LEN),
//         TokenAccount::LEN as u64,
//         &spl_token::id(),
//     );

//     let init_token_account_ix = spl_token::instruction::initialize_account(
//         &spl_token::id(),
//         &authority_token_account_pubkey,
//         &token_mint_pubkey,
//         &authority,
//     )
//     .unwrap();

//     let tx = Transaction::new_signed_with_payer(
//         &[create_token_account_ix, init_token_account_ix],
//         Some(&payer.pubkey()),
//         &[payer, &authority_token_account],
//         context.last_blockhash,
//     );

//     context.banks_client.process_transaction(tx).await.unwrap();

//     // Mint tokens to the authority's token account
//     let mint_to_ix = spl_token::instruction::mint_to(
//         &spl_token::id(),
//         &token_mint_pubkey,
//         &authority_token_account_pubkey,
//         &authority,
//         &[],
//         10u64.pow(8), // Amount of tokens to mint (e.g., 100 USDC)
//     )
//     .unwrap();

//     let tx = Transaction::new_signed_with_payer(
//         &[mint_to_ix],
//         Some(&payer.pubkey()),
//         &[payer],
//         context.last_blockhash,
//     );

//     context.banks_client.process_transaction(tx).await.unwrap();

//     // Derive the market account
//     let (market_account, market_bump) =
//         Pubkey::find_program_address(&[b"market"], &MarketV::id());

//     // Initialize the market
//     let initialize_market_ix = MarketV::initialize(
//         market_account,
//         authority,
//         token_mint_pubkey,
//         60, // Notice period
//     );

//     let tx = Transaction::new_signed_with_payer(
//         &[initialize_market_ix],
//         Some(&payer.pubkey()),
//         &[payer],
//         context.last_blockhash,
//     );

//     context.banks_client.process_transaction(tx).await.unwrap();

//     // Derive the job account
//     let job_index: u128 = 1;
//     let (job_account, job_bump) = Pubkey::find_program_address(
//         &[b"job", &job_index.to_le_bytes()],
//         &MarketV::id(),
//     );

//     // Call the jobOpen instruction
//     let metadata = "metadata example".to_string();
//     let rate: u64 = 10;
//     let balance: u64 = 100 * 10u64.pow(6); // Example balance in smallest unit

//     let job_open_ix = MarketV::job_open(
//         market_account,
//         job_account,
//         authority,
//         token_mint_pubkey,
//         authority_token_account_pubkey,
//         metadata,
//         rate,
//         balance,
//     );

//     let tx = Transaction::new_signed_with_payer(
//         &[job_open_ix],
//         Some(&payer.pubkey()),
//         &[payer],
//         context.last_blockhash,
//     );

//     context.banks_client.process_transaction(tx).await.unwrap();

//     // Fetch and verify the job account data
//     let job_data: Job = context
//         .banks_client
//         .get_account(job_account)
//         .await
//         .unwrap()
//         .unwrap()
//         .data
//         .try_into()
//         .unwrap();

//     assert_eq!(job_data.index, job_index);
//     assert_eq!(job_data.metadata, metadata);
//     assert_eq!(job_data.rate, rate);
//     assert_eq!(job_data.balance, balance);
// }

// #[test]
// async fn test_deploy_and_initialize_programs() {
//     // Initialize the test environment
//     let program_test = ProgramTest::new("oyster_solana_contracts", MarketV::id(), processor!(MarketV::entry))
//         .add_program("oyster_credits", OysterCredits::id(), processor!(OysterCredits::entry));
//     let mut context = program_test.start_with_context().await;

//     // Define key accounts
//     let payer = &context.payer;
//     let authority = payer.pubkey();

//     // Create a mock USDC mint
//     let token_mint = Keypair::new();
//     let token_mint_pubkey = token_mint.pubkey();
//     let rent = context.banks_client.get_rent().await.unwrap();
//     let mint_rent = rent.minimum_balance(Mint::LEN);

//     // Create and initialize the mint account
//     system_program::create_account(
//         CpiContext::new_with_signer(
//             context.banks_client.clone(),
//             system_program::CreateAccount {
//                 from: payer.to_account_info(),
//                 to: token_mint.to_account_info(),
//             },
//             &[&[payer.pubkey().as_ref()]],
//         ),
//         mint_rent,
//         Mint::LEN as u64,
//         &spl_token::id(),
//     )
//     .await
//     .unwrap();

//     token::initialize_mint(
//         CpiContext::new_with_signer(
//             context.banks_client.clone(),
//             token::InitializeMint {
//                 mint: token_mint.to_account_info(),
//                 rent: context.rent.to_account_info(),
//             },
//             &[&[payer.pubkey().as_ref()]],
//         ),
//         6, // USDC typically has 6 decimal places
//         &authority,
//         None,
//     )
//     .await
//     .unwrap();

//     // Derive the market account
//     let (market_account, _market_bump) =
//         Pubkey::find_program_address(&[b"market"], &MarketV::id());

//     // Derive the state account for oyster_credits
//     let (state_account, _state_bump) =
//         Pubkey::find_program_address(&[b"state"], &OysterCredits::id());

//     // Initialize the MarketV program
//     MarketV::initialize(
//         CpiContext::new_with_signer(
//             context.banks_client.clone(),
//             MarketV::Initialize {
//                 market: market_account.to_account_info(),
//                 admin: payer.to_account_info(),
//                 token_mint: token_mint.to_account_info(),
//             },
//             &[&[payer.pubkey().as_ref()]],
//         ),
//         60, // Notice period
//     )
//     .await
//     .unwrap();

//     // Initialize the OysterCredits program
//     OysterCredits::initialize(
//         CpiContext::new_with_signer(
//             context.banks_client.clone(),
//             OysterCredits::Initialize {
//                 state: state_account.to_account_info(),
//                 admin: payer.to_account_info(),
//                 oyster_market: market_account.to_account_info(),
//                 usdc_mint: token_mint.to_account_info(),
//             },
//             &[&[payer.pubkey().as_ref()]],
//         ),
//     )
//     .await
//     .unwrap();

//     // Verify the MarketV program initialization
//     let market_data: Market = context
//         .banks_client
//         .get_account(market_account)
//         .await
//         .unwrap()
//         .unwrap()
//         .data
//         .try_into()
//         .unwrap();

//     assert_eq!(market_data.admin, authority);
//     assert_eq!(market_data.token_mint, token_mint_pubkey);

//     // Verify the OysterCredits program initialization
//     let state_data: State = context
//         .banks_client
//         .get_account(state_account)
//         .await
//         .unwrap()
//         .unwrap()
//         .data
//         .try_into()
//         .unwrap();

//     assert_eq!(state_data.admin, authority);
//     assert_eq!(state_data.oyster_market, market_account);
//     assert_eq!(state_data.usdc_mint, token_mint_pubkey);
// }
