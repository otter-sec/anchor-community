use anchor_lang::prelude::*;

use crate::{error::ErrorCode, AdminFlags, AssetAccessController, MediciFlags, UserRole};

/// Check if user matches controller admin or has role with that matches ANY admin matching_flag.
pub fn verify_admin_signer(
    user: Pubkey,
    asset_access_controller: &AssetAccessController,
    user_role: Option<Account<UserRole>>,
    matching_flag: AdminFlags,
) -> Result<()> {
    if user != asset_access_controller.admin {
        let user_role = user_role.ok_or(ErrorCode::InvalidUserRole)?;
        let is_authorized =
            user_role.has_any_admin_flag(matching_flag) && user_role.users.contains(&user);
        if !is_authorized {
            return err!(ErrorCode::InvalidUserRole);
        }
    }
    Ok(())
}

/// Check if user has role that matches ALL medici matching_flag.
pub fn verify_medici_signer(
    user: &Pubkey,
    user_role: &Account<UserRole>,
    matching_flag: MediciFlags,
) -> Result<()> {
    let is_authorized =
        user_role.has_all_medici_flag(matching_flag) && user_role.users.contains(&user);
    if !is_authorized {
        return err!(ErrorCode::InvalidUserRole);
    }
    Ok(())
}
