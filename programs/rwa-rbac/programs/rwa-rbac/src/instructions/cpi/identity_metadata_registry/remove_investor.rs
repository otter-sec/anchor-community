use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use rbac_utils::{
    constants::{IDENTITY_METADATA_REGISTRY_ID, IDENTITY_REGISTRY_ID, POLICY_ENGINE_ID},
    REMOVE_INVESTOR_IX,
};

use crate::{controller_seeds, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct RemoveInvestor<'info> {
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
    #[account(address = IDENTITY_METADATA_REGISTRY_ID)]
    pub identity_metadata_registry_program: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub investor: UncheckedAccount<'info>,
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
    pub event_authority_identity_metadata_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub event_authority_identity_registry: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub asset_mint: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<RemoveInvestor>) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::REMOVE_INVESTOR,
    )?;

    // Perform CPI to IdentityMetadataRegistry Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.identity_metadata_registry_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.controller_authority.key(), true),
                AccountMeta::new(ctx.accounts.investor.key(), false),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.identity_registry.key(), false),
                AccountMeta::new(ctx.accounts.identity_account.key(), false),
                AccountMeta::new(ctx.accounts.wallet_identity.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
                AccountMeta::new(ctx.accounts.tracker_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.event_authority_identity_registry.key(), false), // For Event CPI
                AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.event_authority_identity_metadata_registry.key(), false), // For Event CPI
                AccountMeta::new_readonly(
                    ctx.accounts.identity_metadata_registry_program.key(),
                    false,
                ), // For Event CPI
            ],
            data: REMOVE_INVESTOR_IX.to_vec(),
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.controller_authority.to_account_info(),
            ctx.accounts.investor.to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
            ctx.accounts.identity_registry.to_account_info(),
            ctx.accounts.identity_account.to_account_info(),
            ctx.accounts.wallet_identity.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
            ctx.accounts.tracker_account.to_account_info(),
            ctx.accounts.event_authority_identity_registry.to_account_info(),
            ctx.accounts.event_authority_identity_metadata_registry.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts
                .identity_metadata_registry_program
                .to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
