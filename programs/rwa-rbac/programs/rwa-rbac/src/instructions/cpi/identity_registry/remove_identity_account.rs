use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use rbac_utils::{constants::IDENTITY_REGISTRY_ID, REVOKE_IDENTITY_ACCOUNT_IX};

use crate::{controller_seeds, error::ErrorCode, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct RemoveIdentityAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    /// CHECK: Verified to match field in asset_access_controller.
    pub controller_authority: UncheckedAccount<'info>,
    #[account(has_one = controller_authority)]
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(has_one = asset_access_controller)]
    pub authorized_user_role: Box<Account<'info, UserRole>>,
    /// CHECK: Checked against known program address.
    #[account(address = IDENTITY_REGISTRY_ID)]
    pub identity_registry_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub identity_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub wallet_identity: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub event_authority: UncheckedAccount<'info>,
    /// CHECK: Checked in handler
    pub identity_owner: SystemAccount<'info>,
    /// CHECK: hardcoded address check
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    #[account(mut)]
    pub tracker_account: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub asset_mint: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<RemoveIdentityAccount>, cpi_data: Vec<u8>) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    let identity_account = &mut ctx.accounts.identity_account;

    let identity_account_owner =
        Pubkey::try_from_slice(&identity_account.data.borrow_mut()[8 + 1 + 32..8 + 1 + 32 + 32])?;
    // only allow direct removal of identity accounts where the owner is an EOA
    // otherwise need to go through the IMR program
    require!(
        identity_account_owner == ctx.accounts.identity_owner.key(),
        ErrorCode::IllegalOperation
    );

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::REMOVE_IDENTITY_ACCOUNT,
    )?;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&REVOKE_IDENTITY_ACCOUNT_IX),
        ErrorCode::UnknownInstruction
    );

    // Perform CPI to IdentityRegistry Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.identity_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.controller_authority.key(), true),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new(ctx.accounts.wallet_identity.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
                AccountMeta::new(ctx.accounts.tracker_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.event_authority.key(), false),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
            ],
            data: cpi_data,
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.controller_authority.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.wallet_identity.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
            ctx.accounts.tracker_account.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
