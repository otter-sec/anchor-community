use anchor_lang::prelude::*;

use crate::{events::RemoveUserRoleEvent, state::*, verify_admin_signer, error::ErrorCode};

#[event_cpi]
#[derive(Accounts)]
pub struct RemoveUserRole<'info> {
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

pub fn handler(ctx: Context<RemoveUserRole>, users_to_remove: Vec<Pubkey>) -> Result<()> {
    let user_role = &mut ctx.accounts.user_role;

    // Apply the following rules if signer is not the controller admin:
    // If authorized_user_role is same as user_role, user_role needs to contain either
    // ASSIGN_OR_REMOVE_ANY_USER_ROLE or ASSIGN_OR_REMOVE_CURRENT_ROLE.
    // If authorized_user_role is not provided or is different from user_role, user_role must contain
    // ASSIGN_OR_REMOVE_ANY_USER_ROLE.
    let mut matching_flag = AdminFlags::ASSIGN_OR_REMOVE_ANY_USER_ROLE;
    if let Some(authorized_role) = &ctx.accounts.authorized_user_role {
        if authorized_role.id == user_role.id {
            matching_flag = matching_flag.union(AdminFlags::ASSIGN_OR_REMOVE_CURRENT_USER_ROLE)
        }
    }
    verify_admin_signer(
        ctx.accounts.user.key(),
        &ctx.accounts.asset_access_controller,
        ctx.accounts.authorized_user_role.clone(),
        matching_flag,
    )?;

    // Remove users from role.
    user_role.remove_users(users_to_remove.clone());

    require!(
        !user_role.is_master_role || user_role.users.len() > 0,
        ErrorCode::CannotEmptyMasterRole
    );

    emit_cpi!(RemoveUserRoleEvent {
        addresses: users_to_remove,
        role: user_role.name.clone(),
        role_id: user_role.id,
        sender: ctx.accounts.user.key(),
        asset_mint: ctx.accounts.asset_access_controller.asset_mint,
    });

    Ok(())
}
