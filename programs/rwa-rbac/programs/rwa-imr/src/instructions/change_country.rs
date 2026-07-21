use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke},
};
use rbac_utils::{constants::IDENTITY_REGISTRY_ID, CHANGE_COUNTRY_IX};

use crate::state::*;

#[derive(Accounts)]
pub struct ChangeCountry<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        has_one = identity_account,
        has_one = identity_registry,
    )]
    pub investor: Account<'info, Investor>,
    /// CHECK: Checked against known program address.
    #[account(address = IDENTITY_REGISTRY_ID)]
    pub identity_registry_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub identity_account: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    #[account(mut)]
    pub policy_engine: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub tracker_account: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub asset_mint: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub event_authority_identity_registry: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<ChangeCountry>, new_country: u8, enforce_limits: bool) -> Result<()> {
    let investor = &mut ctx.accounts.investor;
    investor.last_updated_by = ctx.accounts.payer.key();
    investor.country = new_country;
    // Check that updated investor.levels is still valid.
    investor.validate_country()?;

    let mut data = vec![0u8; 10];
    data[0..8].copy_from_slice(&CHANGE_COUNTRY_IX);
    data[8] = new_country;
    data[9] = enforce_limits as u8;

    invoke(
        &Instruction {
            program_id: ctx.accounts.identity_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.authority.key(), true),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
                AccountMeta::new(ctx.accounts.policy_engine.key(), false),
                AccountMeta::new_readonly(ctx.accounts.tracker_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new_readonly(
                    ctx.accounts.event_authority_identity_registry.key(),
                    false,
                ),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
            ],
            data: data,
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
            ctx.accounts.policy_engine.to_account_info(),
            ctx.accounts.tracker_account.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts
                .event_authority_identity_registry
                .to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
        ],
    )?;
    Ok(())
}
