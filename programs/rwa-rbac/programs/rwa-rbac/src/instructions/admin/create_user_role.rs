use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::*, verify_admin_signer};

#[derive(Accounts)]
pub struct CreateUserRole<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [
            &(asset_access_controller.user_roles_count + 1).to_le_bytes(),
            asset_access_controller.key().as_ref(),
            b"UserRole".as_ref(),
        ],
        bump,
        space = UserRole::BASE_SIZE,
        payer = payer
    )]
    pub new_user_role: Account<'info, UserRole>,
    #[account(mut)]
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(
        has_one = asset_access_controller,
    )]
    pub authorized_user_role: Option<Account<'info, UserRole>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateUserRole>,
    name: String,
    allowed_admin_ixs: u64,
    allowed_medici_ixs: u64,
    is_master_role: bool,
) -> Result<()> {
    let controller = &ctx.accounts.asset_access_controller;

    // Verify that signer is either a controller admin or has authorized user role.
    verify_admin_signer(
        ctx.accounts.user.key(),
        controller,
        ctx.accounts.authorized_user_role.clone(),
        AdminFlags::CREATE_OR_DELETE_USER_ROLE,
    )?;

    if is_master_role {
        require!(
            allowed_admin_ixs == AdminFlags::all().bits()
                && allowed_medici_ixs == MediciFlags::all().bits(),
            ErrorCode::InvalidMasterRole
        );
        require!(!controller.has_master_role, ErrorCode::InvalidMasterRole);
    }

    // Initialize new user role.
    let new_user_role = &mut ctx.accounts.new_user_role;
    new_user_role.asset_access_controller = controller.key();
    new_user_role.id = controller.user_roles_count + 1;
    new_user_role.update_fields(name, allowed_admin_ixs, allowed_medici_ixs)?;

    if is_master_role {
        new_user_role.set_master_role();
    }

    // Perform checked incrementation of user_roles_count.
    let controller = &mut ctx.accounts.asset_access_controller;
    controller.user_roles_count = controller.user_roles_count.checked_add(1).unwrap();

    Ok(())
}
