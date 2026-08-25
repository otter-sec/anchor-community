use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};
use rbac_utils::CREATE_ASSET_CONTROLLER_IX;

use crate::{controller_seeds, error::ErrorCode, state::*};

// Default list of admin signers that are allowed for mainnet.
#[cfg(not(any(feature = "devnet", feature = "localnet")))]
const ALLOWED_SIGNERS: &[&str] = &[
    "5HfSZLzDmRz9wf8rJkvL94MHFKXU7i7px1bWGtLi1R3C",
    "4Ej36rbuZKpN39DuMY94T2pKQf1fvK1ZgyN8otvh85kF",
    "7SDZQ9UraXrzuUVDxGKFApYUaXJehMptH4ZxKWza7sRS",
    "Csx61X6k5cJbhyFuEjDZYFEWts7dt7S3uuraGjznSQ1K",
    "7WJ8t2nySGciAHvbWUYyYmK14jiXfMFJZPsLYSvgPALC",
];

// List of admin signers that are allowed for devnet.
#[cfg(feature = "devnet")]
const ALLOWED_SIGNERS: &[&str] = &[
    "4NYQ9MPM7x5U2mA1yraA871B36fEPHjWegxHPZ69qjW4",
    "F8YqRScWrK9VSYKXK4Thf7GKBp8W1BxzmCYpTH5PYdUm",
    "4H3nAojLDPKBVyrYodVh7Uo65DFbSKKNQSpi7JHLoyrW",
    "GKQUVn1Qm8ouiQSjDYZv3Gbznf7iJfN5pQWgowRiXXU6",
    "3Kcv8Sdw5TQAnsWXhhCEGc7dLavmuvK8Vhf85V5AATnN",
];

// List of admin signers that are allowed for localnet.
#[cfg(feature = "localnet")]
const ALLOWED_SIGNERS: &[&str] = &[
    "3g6fUgMsJQhjPUYxNjEU5PyzGf8DerbDx8p5Qh4yMnRR",
    "rbacxi4BGhh12V7JUxXFMS4CQHNMjk84HWfn7Bp2vfq",
];

#[derive(Accounts)]
#[instruction(unique_seed: Pubkey)]
pub struct CreateAssetAccessController<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub admin: Signer<'info>,
    #[account(
        init,
        seeds = [
            &asset_mint.key().as_ref(),
            b"AssetAccessController".as_ref(),
        ],
        bump,
        space = 8 + std::mem::size_of::<AssetAccessController>(),
        payer = payer
    )]
    pub asset_access_controller: Account<'info, AssetAccessController>,
    /// CHECK: checked through seeds
    #[account(
        seeds = [
            &asset_access_controller.key().as_ref(),
        ],
        bump,
    )]
    pub asset_access_controller_authority: AccountInfo<'info>,
    /// CHECK: cpi checks
    #[account(mut)]
    pub asset_controller: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    #[account(mut, signer)]
    pub asset_mint: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    #[account(mut)]
    pub extra_metas_account: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    #[account(mut)]
    pub policy_engine_account: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    #[account(mut)]
    pub identity_registry_account: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    pub policy_engine_program: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    pub identity_registry_program: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    pub asset_controller_program: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    pub asset_controller_event_authority: UncheckedAccount<'info>,
    /// CHECK: cpi checks
    pub token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateAssetAccessController>, cpi_data: Vec<u8>) -> Result<()> {
    // Check if admin matches allowed signer.
    let admin_key_str = ctx.accounts.admin.key().to_string();
    require!(
        ALLOWED_SIGNERS.contains(&admin_key_str.as_str()),
        ErrorCode::UnauthorizedSigner
    );

    let controller = &mut ctx.accounts.asset_access_controller;
    controller.controller_authority = ctx.accounts.asset_access_controller_authority.key();
    controller.controller_authority_bump = ctx.bumps.asset_access_controller_authority;
    controller.admin = ctx.accounts.admin.key();
    controller.asset_mint = ctx.accounts.asset_mint.key();
    controller.user_roles_count = 0;

    // Verify instruction discriminator in cpi_data
    require!(
        cpi_data.starts_with(&CREATE_ASSET_CONTROLLER_IX),
        ErrorCode::UnknownInstruction
    );

    // Perform CPI to AssetController Program.
    let seeds = controller_seeds!(controller);
    let signers_seeds = &[&seeds[..]];

    invoke_signed(
        &Instruction {
            program_id: ctx.accounts.asset_controller_program.key(),
            accounts: vec![
                // Mutable as authority is used as rent receiver on account closure.
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(
                    ctx.accounts.asset_access_controller_authority.key(),
                    false,
                ),
                AccountMeta::new(ctx.accounts.asset_controller.key(), false),
                AccountMeta::new(ctx.accounts.asset_mint.key(), true),
                AccountMeta::new(ctx.accounts.extra_metas_account.key(), false),
                AccountMeta::new(ctx.accounts.policy_engine_account.key(), false),
                AccountMeta::new(ctx.accounts.identity_registry_account.key(), false),
                AccountMeta::new_readonly(ctx.accounts.policy_engine_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.identity_registry_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                AccountMeta::new_readonly(
                    ctx.accounts.asset_controller_event_authority.key(),
                    false,
                ),
                AccountMeta::new_readonly(ctx.accounts.asset_controller_program.key(), false),
            ],
            data: cpi_data,
        },
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts
                .asset_access_controller_authority
                .to_account_info(),
            ctx.accounts.asset_controller.to_account_info(),
            ctx.accounts.asset_mint.to_account_info(),
            ctx.accounts.extra_metas_account.to_account_info(),
            ctx.accounts.policy_engine_account.to_account_info(),
            ctx.accounts.identity_registry_account.to_account_info(),
            ctx.accounts.policy_engine_program.to_account_info(),
            ctx.accounts.identity_registry_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts
                .asset_controller_event_authority
                .to_account_info(),
            ctx.accounts.asset_controller_program.to_account_info(),
        ],
        signers_seeds,
    )?;

    Ok(())
}
