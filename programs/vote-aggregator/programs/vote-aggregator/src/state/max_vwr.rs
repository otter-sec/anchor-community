use anchor_lang::prelude::*;

/// MaxVoterWeightRecord account
/// The account is used as an api interface to provide max voting power to the
/// governance program from external addin contracts
#[account]
pub struct MaxVoterWeightRecord {
    /// The Realm the MaxVoterWeightRecord belongs to
    pub realm: Pubkey,

    /// Governing Token Mint the MaxVoterWeightRecord is associated with
    /// Note: The addin can take deposits of any tokens and is not restricted to
    /// the community or council tokens only
    // The mint here is to link the record to either community or council mint of the realm
    pub governing_token_mint: Pubkey,

    /// Max voter weight
    /// The max voter weight provided by the addin for the given realm and
    /// governing_token_mint
    pub max_voter_weight: u64,

    /// The slot when the max voting weight expires
    /// It should be set to None if the weight never expires
    /// If the max vote weight decays with time, for example for time locked
    /// based weights, then the expiry must be set. As a pattern Revise
    /// instruction to update the max weight should be invoked before governance
    /// instruction within the same transaction and the expiry set to the
    /// current slot to provide up to date weight
    pub max_voter_weight_expiry: Option<u64>,

    /// Reserved space for future versions
    pub reserved: [u8; 8],
}

impl MaxVoterWeightRecord {
    pub const SPACE: usize = 8 + std::mem::size_of::<Self>();
    pub const ADDRESS_SEED: &'static [u8] = b"max-voter-weight";

    pub fn new(realm: Pubkey, governing_token_mint: Pubkey) -> Self {
        Self {
            realm,
            governing_token_mint,
            max_voter_weight: 0,
            max_voter_weight_expiry: None,
            reserved: Default::default(),
        }
    }
}
