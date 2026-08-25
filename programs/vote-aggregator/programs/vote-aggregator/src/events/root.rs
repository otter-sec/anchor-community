use anchor_lang::prelude::*;

use crate::state::VoterWeightReset;

#[event]
pub struct RootCreated {
    pub root: Pubkey,
    pub governance_program: Pubkey,
    pub realm: Pubkey,
    pub governing_token_mint: Pubkey,
    pub voting_weight_plugin: Option<Pubkey>,
}

#[event]
pub struct MaxVoterWeightChanged {
    pub root: Pubkey,
    pub old_max_voter_weight: u64,
    pub new_max_voter_weight: u64,
}

#[event]
pub struct MaxProposalLifetimeChanged {
    pub root: Pubkey,
    pub old_max_proposal_lifetime: u64,
    pub new_max_proposal_lifetime: u64,
}

#[event]
pub struct VoterWeightResetChanged {
    pub root: Pubkey,
    pub old_voter_weight_reset: Option<VoterWeightReset>,
    pub new_voter_weight_reset: Option<VoterWeightReset>,
}

#[event]
pub struct Paused {
    pub root: Pubkey,
}

#[event]
pub struct Resumed {
    pub root: Pubkey,
}

#[event]
pub struct VoterWeightPluginChanged {
    pub root: Pubkey,
    pub old_voting_weight_plugin: Pubkey,
    pub new_voting_weight_plugin: Pubkey,
}
