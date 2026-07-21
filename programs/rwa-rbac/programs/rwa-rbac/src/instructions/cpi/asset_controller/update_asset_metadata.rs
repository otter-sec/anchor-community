use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use anchor_spl::token_2022::Token2022;
use rbac_utils::{constants::ASSET_CONTROLLER_ID, UPDATE_METADATA_IX};

use crate::{controller_seeds, error::ErrorCode, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct UpdateAssetMetadata<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
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
    pub event_authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<UpdateAssetMetadata>, cpi_data: Vec<u8>) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::UPDATE_ASSET_METADATA,
    )?;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&UPDATE_METADATA_IX),
        ErrorCode::UnknownInstruction
    );

    // Perform CPI to AssetController Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.asset_controller_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new(ctx.accounts.controller_authority.key(), true),
                AccountMeta::new(ctx.accounts.asset_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.asset_controller.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.event_authority.key(), false), // For Event CPI
                AccountMeta::new_readonly(ctx.accounts.asset_controller_program.key(), false), // For Event CPI
            ],
            data: cpi_data,
        },
        &vec![
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.controller_authority.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts.asset_controller.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            ctx.accounts.asset_controller_program.to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
