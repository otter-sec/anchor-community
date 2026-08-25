use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use anchor_spl::token_2022::Token2022;
use rbac_utils::{constants::ASSET_CONTROLLER_ID, SEIZE_TOKENS_IX};

use crate::{controller_seeds, error::ErrorCode, state::*, verify_medici_signer};

#[derive(Accounts)]
pub struct SeizeTokens<'info> {
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
    pub asset_mint: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    pub asset_controller: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub destination_token_account: UncheckedAccount<'info>,
    /// CHECK: Verified in CPI.
    #[account(mut)]
    pub source_token_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token2022>,
    /// CHECK: Verified in CPI.
    pub event_authority: UncheckedAccount<'info>,
}

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, SeizeTokens<'info>>,
    cpi_data: Vec<u8>,
) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer has authorized user role.
    verify_medici_signer(
        &ctx.accounts.user.key(),
        &ctx.accounts.authorized_user_role,
        MediciFlags::SEIZE_TOKENS,
    )?;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&SEIZE_TOKENS_IX),
        ErrorCode::UnknownInstruction
    );

    // Perform CPI to AssetController Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    // Prepare account meta and info vec.
    let mut account_metas = vec![
        AccountMeta::new(ctx.accounts.controller_authority.key(), true),
        AccountMeta::new_readonly(ctx.accounts.asset_mint.key(), false),
        AccountMeta::new_readonly(ctx.accounts.asset_controller.key(), false),
        AccountMeta::new(ctx.accounts.destination_token_account.key(), false),
        AccountMeta::new(ctx.accounts.source_token_account.key(), false),
        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.event_authority.key(), false),
        AccountMeta::new_readonly(ctx.accounts.asset_controller_program.key(), false),
    ];

    let mut account_infos = vec![
        ctx.accounts.controller_authority.to_account_info(),
        ctx.accounts.asset_mint.to_account_info(),
        ctx.accounts.asset_controller.to_account_info(),
        ctx.accounts.destination_token_account.to_account_info(),
        ctx.accounts.source_token_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.event_authority.to_account_info(),
        ctx.accounts.asset_controller_program.to_account_info(),
    ];

    // Add remaining accounts to vecs.
    for x in ctx.remaining_accounts {
        let meta = match x.is_writable {
            true => AccountMeta::new(x.key(), x.is_signer),
            false => AccountMeta::new_readonly(x.key(), x.is_signer),
        };
        account_metas.push(meta);
        account_infos.push(x.clone());
    }

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
