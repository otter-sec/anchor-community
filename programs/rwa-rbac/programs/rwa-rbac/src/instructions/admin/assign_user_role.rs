use anchor_lang::prelude::*;
use rbac_utils::transfer_lamports_for_realloc;

use crate::{events::AssignUserRoleEvent, state::*, verify_admin_signer};

#[event_cpi]
#[derive(Accounts)]
pub struct AssignUserRole<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub asset_access_controller: Account<'info, AssetAccessController>,
    #[account(
        mut,
        has_one = asset_access_controller,
    )]
    pub user_role: Account<'info, UserRole>,
    #[account(has_one = asset_access_controller)]
    pub authorized_user_role: Option<Account<'info, UserRole>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AssignUserRole>, users_to_assign: Vec<Pubkey>) -> Result<()> {
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

    // Check if there's sufficient space to add new users.
    let user_role_info = user_role.to_account_info();

    // Assign users to role.
    user_role.assign_users(users_to_assign.clone());

    let space_needed = UserRole::BASE_SIZE + user_role.users.len() * 32;
    if space_needed > user_role_info.data_len() {
        // Increase account to size of spaced_needed.
        transfer_lamports_for_realloc(
            ctx.accounts.payer.to_account_info(),
            user_role_info.clone(),
            space_needed,
        )?;
        user_role_info.realloc(space_needed, false)?;
    }

    if user_role.is_master_role && user_role.users.len() > 0 {
        ctx.accounts.asset_access_controller.has_master_role = true;
    }

    emit_cpi!(AssignUserRoleEvent {
        addresses: users_to_assign,
        role: user_role.name.clone(),
        role_id: user_role.id,
        sender: ctx.accounts.user.key(),
        asset_mint: ctx.accounts.asset_access_controller.asset_mint,
    });

    Ok(())
}
