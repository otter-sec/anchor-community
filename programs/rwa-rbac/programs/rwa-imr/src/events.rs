use anchor_lang::prelude::*;

#[event]
pub struct RegisterInvestorEvent {
    pub investor_id: String,
    pub level: u8,
    pub expiry: i64,
    pub collision_hash: String,
    pub sender: Pubkey,
    pub country: u8,
}

#[event]
pub struct RemoveInvestorEvent {
    pub investor_id: String,
    pub sender: Pubkey,
}

#[event]
pub struct AddLevelsEvent {
    pub investor_id: String,
    pub sender: Pubkey,
    pub levels: Vec<u8>,
    pub expiries: Vec<i64>,
    pub proof_hashes: Vec<String>,
}

#[event]
pub struct RemoveLevelsEvent {
    pub investor_id: String,
    pub sender: Pubkey,
    pub levels: Vec<u8>,
}
