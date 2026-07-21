use anchor_lang::prelude::*;

#[event]
pub struct ClanCreated {
    pub clan: Pubkey,
    pub root: Pubkey,
    pub clan_index: u64,
    pub owner: Pubkey,
}

#[event]
pub struct ClanOwnerChanged {
    pub clan: Pubkey,
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
}

#[event]
pub struct ClanResized {
    pub clan: Pubkey,
    pub new_size: u32,
}

#[event]
pub struct ClanDelegateChanged {
    pub clan: Pubkey,
    pub old_delegate: Pubkey,
    pub new_delegate: Pubkey,
}

#[event]
pub struct ClanNameChanged {
    pub clan: Pubkey,
    pub old_name: String,
    pub new_name: String,
}

#[event]
pub struct ClanDescriptionChanged {
    pub clan: Pubkey,
    pub old_description: String,
    pub new_description: String,
}

#[event]
pub struct ClanMinVotingWeightToJoinChanged {
    pub clan: Pubkey,
    pub old_min_voting_weight_to_join: u64,
    pub new_min_voting_weight_to_join: u64,
}

#[event]
pub struct ClanAcceptTemporaryMembersChanged {
    pub clan: Pubkey,
    pub old_accept_temporary_members: bool,
    pub new_accept_temporary_members: bool,
}

#[event]
pub struct ClanMemberAdded {
    pub clan: Pubkey,
    pub member: Pubkey,
    pub root: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct ClanVoterWeightChanged {
    pub clan: Pubkey,
    pub root: Pubkey,
    pub old_voter_weight: u64,
    pub new_voter_weight: u64,
    pub old_permament_voter_weight: u64,
    pub new_permament_voter_weight: u64,
    pub old_is_permanent: bool,
    pub new_is_permanent: bool,
}

#[event]
pub struct ClanMemberLeft {
    pub clan: Pubkey,
    pub member: Pubkey,
    pub root: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct ClanVotingDelegateChanged {
    pub clan: Pubkey,
    pub new_voting_delegate: Option<Pubkey>,
    pub old_voting_delegate: Option<Pubkey>,
}

#[event]
pub struct ProposalVoteUpdated {
    pub clan: Pubkey,
    pub proposal: Pubkey,
    pub old_voting_weight: u64,
    pub new_voting_weight: u64,
}

#[event]
pub struct ProposalCanceled {
    pub clan: Pubkey,
    pub proposal: Pubkey,
}