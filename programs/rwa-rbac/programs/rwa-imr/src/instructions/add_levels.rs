use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke},
};
use rbac_utils::{constants::IDENTITY_REGISTRY_ID, ADD_LEVEL_TO_IDENTITY_ACCOUNT_IX};

use crate::{events::AddLevelsEvent, state::*};

#[derive(Accounts)]
#[event_cpi]
pub struct AddLevels<'info> {
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
    pub system_program: Program<'info, System>,
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

pub fn handler(
    ctx: Context<AddLevels>,
    levels: Vec<u8>,
    expiries: Vec<i64>,
    proof_hashes: Vec<String>,
    enforce_limits: bool,
) -> Result<()> {
    require_eq!(levels.len(), expiries.len());
    require_eq!(expiries.len(), proof_hashes.len());

    let investor = &mut ctx.accounts.investor;
    investor.last_updated_by = ctx.accounts.payer.key();
    for i in 0..levels.len() {
        investor.levels.push(LevelData {
            level: levels[i],
            proof_hash: proof_hashes[i].clone(),
        });
    }

    // Check that updated investor.levels is still valid.
    investor.validate_levels()?;

    let mut data: Vec<u8> = Vec::with_capacity(8 + 4 + levels.len() + 4 + expiries.len() * 8 + 1);
    data.resize(8 + 4 + levels.len() + 4 + expiries.len() * 8 + 1, 0);

    data[0..8].copy_from_slice(&ADD_LEVEL_TO_IDENTITY_ACCOUNT_IX);

    let mut offset = 12 + levels.len();
    data[8..12].copy_from_slice(&(levels.len() as u32).to_le_bytes());
    data[12..offset].copy_from_slice(&levels);

    data[offset..offset + 4].copy_from_slice(&(expiries.len() as u32).to_le_bytes());
    offset += 4;
    for i in 0..expiries.len() {
        data[offset + i * 8..offset + (i + 1) * 8].copy_from_slice(&expiries[i].to_le_bytes());
    }
    data[offset + expiries.len() * 8..].copy_from_slice(&[enforce_limits as u8]);

    emit_cpi!(AddLevelsEvent {
        investor_id: investor.investor_id.clone(),
        sender: ctx.accounts.payer.key(),
        levels,
        expiries,
        proof_hashes,
    });

    invoke(
        &Instruction {
            program_id: ctx.accounts.identity_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.authority.key(), true),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
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
            data,
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
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
