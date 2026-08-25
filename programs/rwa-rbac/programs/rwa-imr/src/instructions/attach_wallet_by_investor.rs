use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use rbac_utils::{
    constants::IDENTITY_REGISTRY_ID, external_accounts::WalletIdentity,
    ATTACH_WALLET_TO_IDENTITY_IX,
};

use crate::state::*;

#[derive(Accounts)]
pub struct AttachWalletByInvestor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub wallet: Signer<'info>,
    #[account(
        has_one = identity_account,
        has_one = identity_registry,
    )]
    pub investor: Account<'info, Investor>,
    /// CHECK: Checked to match identity account and signed wallet.
    pub wallet_identity: UncheckedAccount<'info>,
    /// CHECK: Checked against known program address.
    #[account(address = IDENTITY_REGISTRY_ID)]
    pub identity_registry_program: UncheckedAccount<'info>,
    /// CHECK: For wallet to be added. Verified in CPI
    #[account(mut)]
    pub new_wallet_identity: UncheckedAccount<'info>,
    /// CHECK: Matches known identity account.
    #[account(mut)]
    pub identity_account: UncheckedAccount<'info>,
    /// CHECK: Matches known identity registry.
    pub identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub asset_mint: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Verified in CPI.
    pub event_authority_identity_registry: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<AttachWalletByInvestor>, new_wallet: Pubkey) -> Result<()> {
    let investor = &ctx.accounts.investor;

    // Verify that a wallet identity matching identity account of investor and
    // signed wallet exists.
    let wallet_identity = WalletIdentity::deserialize_checked(&ctx.accounts.wallet_identity)?;
    require_keys_eq!(
        wallet_identity.identity_account,
        ctx.accounts.identity_account.key()
    );
    require_keys_eq!(ctx.accounts.wallet.key(), wallet_identity.wallet);

    // Perform CPI to IdentityRegistry Program.
    let seeds = [
        &investor.investor_id.as_ref(),
        &investor.identity_registry.as_ref(),
        b"Investor".as_ref(),
        &[investor.bump],
    ];
    let signers_seeds = &[&seeds[..]];

    let mut cpi_data = ATTACH_WALLET_TO_IDENTITY_IX.to_vec();
    cpi_data.extend(new_wallet.as_ref());

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.identity_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.investor.key(), true),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new(ctx.accounts.new_wallet_identity.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(
                    ctx.accounts.event_authority_identity_registry.key(),
                    false,
                ),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
            ],
            data: cpi_data,
        },
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.investor.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts.new_wallet_identity.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts
                .event_authority_identity_registry
                .to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
