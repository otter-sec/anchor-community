use anchor_lang::prelude::*;

use crate::{state::*, verify_admin_signer};

#[derive(Accounts)]
pub struct ModifyUserRole<'info> {
    pub user: Signer<'info>,
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(
        mut,
        has_one = asset_access_controller,
    )]
    pub user_role: Account<'info, UserRole>,
    #[account(has_one = asset_access_controller)]
    pub authorized_user_role: Option<Account<'info, UserRole>>,
}

pub fn handler(
    ctx: Context<ModifyUserRole>,
    name: String,
    allowed_admin_ixs: u64,
    allowed_medici_ixs: u64,
) -> Result<()> {
    // Verify that signer is either a controller admin or has authorized user role.
    verify_admin_signer(
        ctx.accounts.user.key(),
        &ctx.accounts.asset_access_controller,
        ctx.accounts.authorized_user_role.clone(),
        AdminFlags::MODIFY_USER_ROLE,
    )?;

    // Update user role.
    let user_role = &mut ctx.accounts.user_role;
    user_role.update_fields(name, allowed_admin_ixs, allowed_medici_ixs)?;

    Ok(())
}
