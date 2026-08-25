use anchor_lang::prelude::*;

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct VoterWeightReset {
    pub next_reset_time: i64,
    pub step: u64,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct RootBumps {
    pub root: u8,
    pub max_voter_weight: u8,
    pub lock_authority: u8,
}

#[account]
pub struct Root {
    pub governance_program: Pubkey,   // 8
    pub realm: Pubkey,                // 40
    pub governing_token_mint: Pubkey, // 72
    pub voting_weight_plugin: Pubkey, // 104
    pub max_proposal_lifetime: u64,
    pub voter_weight_reset: Option<VoterWeightReset>,
    pub clan_count: u64,
    pub member_count: u64,
    pub bumps: RootBumps,
    pub paused: bool,
}

impl Root {
    pub const SPACE: usize = 8 + std::mem::size_of::<Self>();
    pub const ADDRESS_SEED: &'static [u8] = b"root";
    pub const LOCK_AUTHORITY_SEED: &'static [u8] = b"lock-authority";

    pub fn update_next_voter_weight_reset_time(&mut self, clock: &Clock) {
        self.voter_weight_reset = if let Some(r) = self.voter_weight_reset.take() {
            if clock.unix_timestamp >= r.next_reset_time {
                if r.step > 0 {
                    Some(VoterWeightReset {
                        next_reset_time: r.next_reset_time
                            + ((clock.unix_timestamp - r.next_reset_time) / r.step as i64 + 1)
                                * r.step as i64,
                        ..r
                    })
                } else {
                    None
                }
            } else {
                Some(r)
            }
        } else {
            None
        };
    }

    pub fn next_voter_weight_reset_time(&self) -> Option<i64> {
        self.voter_weight_reset.as_ref().map(|r| r.next_reset_time)
    }
}
