use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
    #[msg("Realm has no authority. Please create another realm with authority set")]
    EmptyRealmAuthority,
    #[msg("Wrong realm authority")]
    WrongRealmAuthority,
    #[msg("Wrong member authority")]
    WrongMemberAuthority,
    #[msg("Wrong clan authority")]
    WrongClanAuthority,
    #[msg("Your voting power is not enough to join this clan")]
    TooLowVotingPower,
    #[msg("Can not exit clan waiting for the leave time")]
    TooEarlyToExitClan,
    #[msg("Must start leaving clan first")]
    UnexpectedExitingClan,
    #[msg("Proposal vote has correct weight already")]
    NoNeedToUpdateProposalVote,
    #[msg("Wrong community voter addin (must be this program ID)")]
    WrongCommunityVoterWeightAddin,
    #[msg("Must use this program ID as community voter weight addin")]
    EmptyCommunityVoterWeightAddin,
    #[msg("Wrong max community voter weight addin (must be this program ID)")]
    WrongMaxCommunityVoterWeightAddin,
    #[msg("Must use this program ID as max community voter weight addin")]
    EmptyMaxCommunityVoterWeightAddin,
    #[msg("Wrong council voter weight addin (must be this program ID)")]
    WrongCouncilVoterWeightAddin,
    #[msg("Must use this program ID as council voter weight addin")]
    MustUseCouncilVoterWeightAddin,
    #[msg("Wrong council max vote weight addin (must be this program ID)")]
    WrongCouncilMaxVoteWeightAddin,
    #[msg("Must use this program ID as council max vote weight addin")]
    MustUseCouncilMaxVoteWeightAddin,
    #[msg("Reset voting delegate before changing clan owner")]
    ChangingVoteDelegatedClanOwner,
    #[msg("Must provide clan account")]
    ClanIsRequired,
    ClanVoterWeightRecordIsRequired,
    #[msg("Must provide voting weight record account")]
    VotingWeightRecordIsRequired,
    #[msg("Must provide max voter weight")]
    MaxVoterWeightIsRequired,
    #[msg("Must provide clan authority")]
    ClanAuthorityIsRequired,
    #[msg("Requesting leaving clan when already leaving")]
    RerequestingLeavingClan,
    #[msg("Canceling leaving clan while not leaving")]
    CancelingNonExistentLeavingClanRequest,
    #[msg("Requesting to join a clan while already participating in some clan. Must exit first")]
    AlreadyJoinedClan,
    MaxMembershipExceeded,
    InvalidShareBp,
    UnknownGoverningTokenMint,
    InvalidCouncilMint,
    CouncilMintRequired,
    CouncilTokenHoldingsRequired,
    CircularPluginChain,
    VoterWeightExpiryIsNotImplemented,
    UnexpectedWeightAction,
    UnexpectedWeightActionTarget,
    NextInstructionMustBeSetRealmConfig,
    VoterWeightExpired,
    TemporaryMembersNotAllowed,
    TemporaryMembersNotUpdated,
    UnexpectedClan,
    MemberHasUnrelinquishedVotes,
    MemberHasOutstandingProposals,
    CanNotChangeNextResetTime,
    InvalidResetStep,
    InvalidNextResetTime,
    Paused,
    MemberVwrRequired,
    ResetAllVoterWeightsFirst,
}