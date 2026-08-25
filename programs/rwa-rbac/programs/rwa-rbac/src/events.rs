use anchor_lang::prelude::*;

#[event]
pub struct AssignUserRoleEvent {
    pub addresses: Vec<Pubkey>,
    pub role: String,
    pub role_id: u64,
    pub sender: Pubkey,
    pub asset_mint: Pubkey,
}

#[event]
pub struct RemoveUserRoleEvent {
    pub addresses: Vec<Pubkey>,
    pub role: String,
    pub role_id: u64,
    pub sender: Pubkey,
    pub asset_mint: Pubkey,
}
