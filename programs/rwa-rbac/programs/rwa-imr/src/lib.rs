#![allow(ambiguous_glob_reexports)]

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

use anchor_lang::prelude::*;

declare_id!("D2V7wTBbNCKgYwirgRUnSmc2QyKnHSVmRotWJ4rz8Jp9");

#[program]
pub mod rwa_imr {
    use super::*;

    pub fn register_investor(
        ctx: Context<RegisterInvestor>,
        investor_id: String,
        collision_hash: String,
        level: u8,
        expiry: i64,
        country: u8,
        proof_hash: String,
    ) -> Result<()> {
        instructions::register_investor::handler(
            ctx,
            investor_id,
            collision_hash,
            level,
            expiry,
            country,
            proof_hash,
        )
    }

    pub fn remove_investor(ctx: Context<RemoveInvestor>) -> Result<()> {
        instructions::remove_investor::handler(ctx)
    }

    pub fn attach_wallet_by_investor(
        ctx: Context<AttachWalletByInvestor>,
        new_wallet: Pubkey,
    ) -> Result<()> {
        instructions::attach_wallet_by_investor::handler(ctx, new_wallet)
    }

    pub fn add_levels(
        ctx: Context<AddLevels>,
        levels: Vec<u8>,
        expiries: Vec<i64>,
        proof_hashes: Vec<String>,
        enforce_limits: bool,
    ) -> Result<()> {
        instructions::add_levels::handler(ctx, levels, expiries, proof_hashes, enforce_limits)
    }

    pub fn remove_levels(
        ctx: Context<RemoveLevels>,
        levels_to_remove: Vec<u8>,
        enforce_limits: bool,
    ) -> Result<()> {
        instructions::remove_levels::handler(ctx, levels_to_remove, enforce_limits)
    }

    pub fn change_country(
        ctx: Context<ChangeCountry>,
        new_country: u8,
        enforce_limits: bool,
    ) -> Result<()> {
        instructions::change_country::handler(ctx, new_country, enforce_limits)
    }
}
