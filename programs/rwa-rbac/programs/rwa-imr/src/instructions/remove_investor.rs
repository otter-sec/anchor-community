use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke},
};
use rbac_utils::{
    constants::{IDENTITY_REGISTRY_ID, POLICY_ENGINE_ID},
    REVOKE_IDENTITY_ACCOUNT_IX,
};

use crate::{events::RemoveInvestorEvent, state::*};

#[event_cpi]
#[derive(Accounts)]
pub struct RemoveInvestor<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = payer,
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
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub wallet_identity: UncheckedAccount<'info>,
    /// CHECK: Checked against known program address.
    #[account(address = POLICY_ENGINE_ID)]
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub tracker_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub event_authority_identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub asset_mint: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<RemoveInvestor>) -> Result<()> {
    emit_cpi!(RemoveInvestorEvent {
        investor_id: ctx.accounts.investor.investor_id.clone(),
        sender: ctx.accounts.payer.key()
    });

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
                AccountMeta::new_readonly(
                    ctx.accounts.event_authority_identity_registry.key(),
                    false,
                ),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
            ],
            data: [
                &REVOKE_IDENTITY_ACCOUNT_IX,
                ctx.accounts.investor.key().as_ref(),
            ]
            .concat(),
        },
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.wallet_identity.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
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
