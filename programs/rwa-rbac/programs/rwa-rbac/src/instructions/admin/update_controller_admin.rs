use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::*};

#[derive(Accounts)]
pub struct UpdateControllerAdmin<'info> {
    pub admin: Signer<'info>,
    #[account(mut, has_one = admin)]
    pub asset_access_controller: Account<'info, AssetAccessController>,
}

pub fn handler(ctx: Context<UpdateControllerAdmin>, new_admin: Pubkey) -> Result<()> {
    let controller = &mut ctx.accounts.asset_access_controller;

    if !controller.has_master_role {
        require!(
            new_admin != Pubkey::default(),
            ErrorCode::CannotVoidAuthority
        );
    }

    controller.admin = new_admin;

    Ok(())
}
