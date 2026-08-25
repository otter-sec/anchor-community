#![allow(ambiguous_glob_reexports)]

pub mod error;
pub mod events;
pub mod helper;
pub mod instructions;
pub mod macros;
pub mod state;

pub use helper::*;
pub use instructions::*;
pub use state::*;

use anchor_lang::prelude::*;

declare_id!("3g6fUgMsJQhjPUYxNjEU5PyzGf8DerbDx8p5Qh4yMnRR");

#[program]
pub mod rwa_rbac {
    use super::*;

    pub fn create_controller(
        ctx: Context<CreateAssetAccessController>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::create_controller::handler(ctx, cpi_data)
    }

    pub fn update_controller_admin(
        ctx: Context<UpdateControllerAdmin>,
        new_admin: Pubkey,
    ) -> Result<()> {
        instructions::update_controller_admin::handler(ctx, new_admin)
    }

    pub fn withdraw_excess_rent(ctx: Context<WithdrawExcessRent>) -> Result<()> {
        instructions::withdraw_excess_rent::handler(ctx)
    }

    pub fn create_user_role(
        ctx: Context<CreateUserRole>,
        name: String,
        allowed_admin_ixs: u64,
        allowed_medici_ixs: u64,
        is_master_role: bool,
    ) -> Result<()> {
        instructions::create_user_role::handler(ctx, name, allowed_admin_ixs, allowed_medici_ixs, is_master_role)
    }

    pub fn modify_user_role(
        ctx: Context<ModifyUserRole>,
        name: String,
        allowed_admin_ixs: u64,
        allowed_medici_ixs: u64,
    ) -> Result<()> {
        instructions::modify_user_role::handler(ctx, name, allowed_admin_ixs, allowed_medici_ixs)
    }

    pub fn delete_user_role(ctx: Context<DeleteUserRole>) -> Result<()> {
        instructions::delete_user_role::handler(ctx)
    }

    pub fn assign_user_role(
        ctx: Context<AssignUserRole>,
        users_to_assign: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::assign_user_role::handler(ctx, users_to_assign)
    }

    pub fn remove_user_role(
        ctx: Context<RemoveUserRole>,
        users_to_remove: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::remove_user_role::handler(ctx, users_to_remove)
    }

    pub fn issue_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, IssueTokens<'info>>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::issue_tokens::handler(ctx, cpi_data)
    }

    pub fn update_asset_metadata(
        ctx: Context<UpdateAssetMetadata>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::update_asset_metadata::handler(ctx, cpi_data)
    }

    pub fn thaw_token_account(ctx: Context<ThawTokenAccount>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::thaw_token_account::handler(ctx, cpi_data)
    }

    pub fn freeze_token_account(ctx: Context<FreezeTokenAccount>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::freeze_token_account::handler(ctx, cpi_data)
    }

    pub fn seize_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, SeizeTokens<'info>>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::seize_tokens::handler(ctx, cpi_data)
    }

    pub fn revoke_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, RevokeTokens<'info>>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::revoke_tokens::handler(ctx, cpi_data)
    }

    pub fn attach_to_policy_engine(
        ctx: Context<AttachToPolicyEngine>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::attach_to_policy_engine::handler(ctx, cpi_data)
    }

    pub fn change_counters(ctx: Context<ChangeCounters>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::change_counters::handler(ctx, cpi_data)
    }

    pub fn change_counter_limits(
        ctx: Context<ChangeCounterLimits>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::change_counter_limits::handler(ctx, cpi_data)
    }

    pub fn detach_from_policy_engine(
        ctx: Context<DetachFromPolicyEngine>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::detach_from_policy_engine::handler(ctx, cpi_data)
    }

    pub fn register_investor(ctx: Context<RegisterInvestor>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::register_investor::handler(ctx, cpi_data)
    }

    pub fn remove_investor(ctx: Context<RemoveInvestor>) -> Result<()> {
        instructions::remove_investor::handler(ctx)
    }

    pub fn add_levels(ctx: Context<AddLevels>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::add_levels::handler(ctx, cpi_data)
    }

    pub fn remove_levels(ctx: Context<RemoveLevels>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::remove_levels::handler(ctx, cpi_data)
    }

    pub fn attach_wallet_to_identity(
        ctx: Context<AttachWalletToIdentity>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::attach_wallet_to_identity::handler(ctx, cpi_data)
    }

    pub fn detach_wallet_from_identity(
        ctx: Context<DetachWalletFromIdentity>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::detach_wallet_from_identity::handler(ctx, cpi_data)
    }

    pub fn create_identity_account(
        ctx: Context<CreateIdentityAccount>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::create_identity_account::handler(ctx, cpi_data)
    }

    pub fn remove_identity_account(
        ctx: Context<RemoveIdentityAccount>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::remove_identity_account::handler(ctx, cpi_data)
    }

    pub fn change_country(ctx: Context<ChangeCountry>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::change_country::handler(ctx, cpi_data)
    }

    pub fn change_mapping(ctx: Context<ChangeMapping>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::change_mapping::handler(ctx, cpi_data)
    }

    pub fn change_issuance_policies(
        ctx: Context<ChangeIssuancePolicies>,
        cpi_data: Vec<u8>,
    ) -> Result<()> {
        instructions::change_issuance_policies::handler(ctx, cpi_data)
    }

    pub fn set_counters(ctx: Context<SetCounters>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::set_counters::handler(ctx, cpi_data)
    }

    pub fn add_lock(ctx: Context<AddLock>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::add_lock::handler(ctx, cpi_data)
    }

    pub fn remove_lock(ctx: Context<RemoveLock>, cpi_data: Vec<u8>) -> Result<()> {
        instructions::remove_lock::handler(ctx, cpi_data)
    }

    pub fn set_lut_address(ctx: Context<SetLookuptableAddress>) -> Result<()> {
        instructions::set_lut_address::handler(ctx)
    }
}
