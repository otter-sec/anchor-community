use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use anchor_spl::{associated_token::AssociatedToken, token_2022::Token2022};
use rbac_utils::{constants::ASSET_CONTROLLER_ID, REVOKE_TOKENS_IX};

use crate::{controller_seeds, error::ErrorCode, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct RevokeTokens<'info> {
    pub user: Signer<'info>,
    /// CHECK: Verified to match field in asset_access_controller.
    #[account(mut)]
    pub controller_authority: UncheckedAccount<'info>,
    #[account(has_one = controller_authority)]
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(has_one = asset_access_controller)]
    pub authorized_user_role: Box<Account<'info, UserRole>>,
    /// CHECK: Checked against known program address.
    #[account(address = ASSET_CONTROLLER_ID)]
    pub asset_controller_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub asset_mint: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub asset_controller: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub revoke_token_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub identity_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub tracker_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub policy_engine: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub wallet_identity_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    /// CHECK: Verified in CPI.
    pub event_authority: UncheckedAccount<'info>,
}

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, RevokeTokens<'info>>,
    cpi_data: Vec<u8>,
) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::REVOKE_TOKENS,
    )?;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&REVOKE_TOKENS_IX),
        ErrorCode::UnknownInstruction
    );

    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    // Prepare account meta and info vec.
    let account_metas = vec![
        AccountMeta::new(ctx.accounts.controller_authority.key(), true),
        AccountMeta::new(ctx.accounts.asset_mint.key(), false),
        AccountMeta::new_readonly(ctx.accounts.asset_controller.key(), false),
        AccountMeta::new(ctx.accounts.revoke_token_account.key(), false),
        AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
        AccountMeta::new_readonly(ctx.accounts.identity_account.key(), false),
        AccountMeta::new(ctx.accounts.tracker_account.key(), false),
        AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
        AccountMeta::new(ctx.accounts.policy_engine.key(), false),
        AccountMeta::new_readonly(ctx.accounts.wallet_identity_account.key(), false),
        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.associated_token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.event_authority.key(), false),
        AccountMeta::new_readonly(ctx.accounts.asset_controller_program.key(), false),
    ];
    let account_infos = vec![
        ctx.accounts.controller_authority.to_account_info(),
        ctx.accounts.asset_mint.to_account_info(),
        ctx.accounts.asset_controller.to_account_info(),
        ctx.accounts.revoke_token_account.to_account_info(),
        ctx.accounts.identity_registry.to_account_info(),
        ctx.accounts.identity_account.to_account_info(),
        ctx.accounts.tracker_account.to_account_info(),
        ctx.accounts.policy_engine_program.to_account_info(),
        ctx.accounts.policy_engine.to_account_info(),
        ctx.accounts.wallet_identity_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.associated_token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.event_authority.to_account_info(),
        ctx.accounts.asset_controller_program.to_account_info(),
    ];

    // Perform CPI to AssetController Program.
    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.asset_controller_program.key(),
            accounts: account_metas,
            data: cpi_data,
        },
        &account_infos,
        signers_seeds,
    )?;

    Ok(())
}
