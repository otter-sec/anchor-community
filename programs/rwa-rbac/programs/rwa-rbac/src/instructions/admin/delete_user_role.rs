use anchor_lang::prelude::*;

use crate::{state::*, verify_admin_signer, error::ErrorCode};

#[derive(Accounts)]
pub struct DeleteUserRole<'info> {
    /// CHECK: Account to receive rent refund.
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,
    pub user: Signer<'info>,
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(
        mut,
        close = receiver,
        has_one = asset_access_controller,
    )]
    pub user_role: Account<'info, UserRole>,
    #[account(has_one = asset_access_controller)]
    pub authorized_user_role: Option<Account<'info, UserRole>>,
}

pub fn handler(ctx: Context<DeleteUserRole>) -> Result<()> {
    // Verify that signer is either a controller admin or has authorized user role.
    verify_admin_signer(
        ctx.accounts.user.key(),
        &ctx.accounts.asset_access_controller,
        ctx.accounts.authorized_user_role.clone(),
        AdminFlags::CREATE_OR_DELETE_USER_ROLE,
    )?;

    require!(
        !ctx.accounts.user_role.is_master_role,
        ErrorCode::CannotDeleteMasterRole
    );

    Ok(())
}
