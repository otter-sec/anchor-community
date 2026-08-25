use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use rbac_utils::{constants::POLICY_ENGINE_ID, CHANGE_COUNTERS_IX};

use crate::{controller_seeds, error::ErrorCode, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct ChangeCounters<'info> {
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
    #[account(address = POLICY_ENGINE_ID)]
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub policy_engine: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Verified in CPI.
    pub event_authority: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<ChangeCounters>, cpi_data: Vec<u8>) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::CHANGE_COUNTERS,
    )?;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&CHANGE_COUNTERS_IX),
        ErrorCode::UnknownInstruction
    );

    // Perform CPI to PolicyEngine Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.policy_engine_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.controller_authority.key(), true),
                AccountMeta::new(ctx.accounts.policy_engine.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.event_authority.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
            ],
            data: cpi_data,
        },
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.controller_authority.to_account_info(),
            ctx.accounts.policy_engine.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
