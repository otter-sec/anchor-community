use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke},
};
use rbac_utils::{constants::IDENTITY_REGISTRY_ID, is_valid_hash, CREATE_IDENTITY_ACCOUNT_IX};

use crate::{error::ErrorCode, events::RegisterInvestorEvent, state::*};

#[event_cpi]
#[derive(Accounts)]
#[instruction(investor_id: String)]
pub struct RegisterInvestor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// Authority has to be authority or delegate of IdentityRegistry for CPI to succeed.
    pub authority: Signer<'info>,
    #[account(
        init,
        seeds = [
            &investor_id.as_ref(),
            &identity_registry.key().as_ref(),
            b"Investor".as_ref(),
        ],
        bump,
        space = 8 + Investor::INIT_SPACE,
        payer = payer
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
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub wallet_identity: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    #[account(mut)]
    pub tracker_account: UncheckedAccount<'info>,
    /// CHECK: checked in cpi
    pub asset_mint: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Verified in CPI.
    pub event_authority_identity_registry: UncheckedAccount<'info>,
}

pub fn handler(
    ctx: Context<RegisterInvestor>,
    investor_id: String,
    collision_hash: String,
    level: u8,
    expiry: i64,
    country: u8,
    proof_hash: String,
) -> Result<()> {
    require!(is_valid_hash(&investor_id), ErrorCode::InvalidHash);
    require!(is_valid_hash(&collision_hash), ErrorCode::InvalidHash);

    emit_cpi!(RegisterInvestorEvent {
        investor_id: investor_id.clone(),
        level,
        expiry,
        collision_hash: collision_hash.clone(),
        sender: ctx.accounts.payer.key(),
        country
    });

    let investor = &mut ctx.accounts.investor;

    investor.authority = ctx.accounts.authority.key();
    investor.identity_account = ctx.accounts.identity_account.key();
    investor.identity_registry = ctx.accounts.identity_registry.key();
    investor.bump = ctx.bumps.investor;
    investor.investor_id = investor_id;
    investor.collision_hash = collision_hash;
    investor.last_updated_by = ctx.accounts.payer.key();
    investor.levels = vec![LevelData { level, proof_hash }];
    investor.country = country;

    // Build data arg for CPI manually.
    let cpi_data = [
        &CREATE_IDENTITY_ACCOUNT_IX,
        ctx.accounts.investor.key().as_ref(), // Set Investor PDA as IdentityAccount.
        &[level],
        &expiry.to_le_bytes(),
        &[country],
    ]
    .concat();

    // Perform CPI to IdentityRegistry Program.
    invoke(
        &Instruction {
            program_id: ctx.accounts.identity_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.authority.key(), true),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new(ctx.accounts.wallet_identity.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
                AccountMeta::new(ctx.accounts.tracker_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(
                    ctx.accounts.event_authority_identity_registry.key(),
                    false,
                ),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
            ],
            data: cpi_data,
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.wallet_identity.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
            ctx.accounts.tracker_account.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts
                .event_authority_identity_registry
                .to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
        ],
    )?;
    Ok(())
}
