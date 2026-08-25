use crate::events::clan::ClanVoterWeightChanged;
use anchor_lang::prelude::*;
use spl_governance_addin_api::voter_weight::VoterWeightRecord as SplVoterWeightRecord;

use super::{Member, Root, VoterWeightRecord, VoterWeightReset};

#[derive(Clone, AnchorSerialize, AnchorDeserialize, Default)]
pub struct ClanBumps {
    pub voter_authority: u8,
    pub token_owner_record: u8,
    pub voter_weight_record: u8,
}

#[account]
#[derive(Default)]
pub struct Clan {
    pub root: Pubkey,
    pub owner: Pubkey,
    pub delegate: Pubkey,
    pub voter_authority: Pubkey,
    pub token_owner_record: Pubkey,
    pub voter_weight_record: Pubkey,
    pub min_voting_weight_to_join: u64,
    pub permanent_members: u64,
    pub temporary_members: u64,
    pub updated_temporary_members: u64,
    pub leaving_members: u64,
    pub accept_temporary_members: bool,
    pub permanent_voter_weight: u64, // not decaiying part
    pub next_voter_weight_reset_time: Option<i64>,
    pub name: String,
    pub description: String,
    pub bumps: ClanBumps,
}

impl Clan {
    pub const SPACE: usize = 8 + std::mem::size_of::<Self>();
    pub const VOTER_AUTHORITY_SEED: &'static [u8] = b"voter-authority";

    pub fn reset_voter_weight_if_needed(&mut self, root: &Root, clan_vwr: &mut VoterWeightRecord) {
        if let Some(VoterWeightReset {
            next_reset_time, ..
        }) = &root.voter_weight_reset
        {
            if self.next_voter_weight_reset_time.is_none()
                || self.next_voter_weight_reset_time.unwrap() < *next_reset_time
            {
                self.next_voter_weight_reset_time = Some(*next_reset_time);
                clan_vwr.voter_weight = self.permanent_voter_weight;
                clan_vwr.voter_weight_expiry = None;
                self.updated_temporary_members = 0;
            }
        } else {
            self.next_voter_weight_reset_time = None;
        }
    }

    pub fn update_member<'info>(
        clan: &mut Account<'info, Self>,
        member: &Member,
        old_share_bp: Option<u16>, // None means was not a member
        // None is useful if we need to change membership without updating voter weight
        new_member_vwr: Option<&SplVoterWeightRecord>,
        new_share_bp: Option<u16>, // None means will be not a member
        clan_vwr: &mut VoterWeightRecord,
        clock: &Clock,
    ) -> Result<()> {
        let old_clan_voter_weight = clan_vwr.voter_weight;
        let old_clan_voter_weight_expiry = clan_vwr.voter_weight_expiry;
        let old_permament_clan_voter_weight = clan.permanent_voter_weight;

        // Remove the old state of the member from the clan
        if let Some(old_share_bp) = old_share_bp {
            let old_member_voter_weight =
                ((member.voter_weight as u128) * (old_share_bp as u128) / 10000) as u64;
            let is_outdated = member.voter_weight_expiry.is_some()
                && member.next_voter_weight_reset_time != clan.next_voter_weight_reset_time;
            if !is_outdated {
                // if temporary member was outdated
                // then it's power was already removed on the previous clan reset
                clan_vwr.voter_weight -= old_member_voter_weight;
            }
            if member.voter_weight_expiry.is_none() {
                clan.permanent_voter_weight -= old_member_voter_weight;
                clan.permanent_members -= 1;
            } else {
                clan.temporary_members -= 1;
                if !is_outdated {
                    // all outdates was already removed on clan reset
                    clan.updated_temporary_members -= 1;
                }
            }
        }

        // Install the new state of the member to the clan
        if let Some(new_share_bp) = new_share_bp {
            // Not updating the member's VWR is the same as updating to the current values
            let new_member_voter_weight = ((if let Some(new_member_vwr) = new_member_vwr {
                new_member_vwr.voter_weight
            } else {
                member.voter_weight
            } as u128)
                * (new_share_bp as u128)
                / 10000) as u64;

            let new_member_voter_weight_expiry = if let Some(new_member_vwr) = new_member_vwr {
                new_member_vwr.voter_weight_expiry
            } else {
                member.voter_weight_expiry
            };

            clan_vwr.voter_weight += new_member_voter_weight;
            if new_member_voter_weight_expiry.is_none() {
                clan.permanent_voter_weight += new_member_voter_weight;
                clan.permanent_members += 1;
            } else {
                clan.temporary_members += 1;
                // Counts as updated in any case
                clan.updated_temporary_members += 1;
            }
        }

        // Update the clan's VWR permanent/temporary status
        clan_vwr.voter_weight_expiry = if clan.permanent_voter_weight == clan_vwr.voter_weight {
            None
        } else {
            Some(clock.slot as i64)
        };

        emit!(ClanVoterWeightChanged {
            clan: clan.key(),
            root: clan.root,
            old_voter_weight: old_clan_voter_weight,
            new_voter_weight: clan_vwr.voter_weight,
            old_permament_voter_weight: old_permament_clan_voter_weight,
            new_permament_voter_weight: clan.permanent_voter_weight,
            old_is_permanent: old_clan_voter_weight_expiry.is_none(),
            new_is_permanent: clan_vwr.voter_weight_expiry.is_none(),
        });
        Ok(())
    }

    pub fn is_updated(&self, root: &Root) -> bool {
        let clock = Clock::get().unwrap();
        if root.voter_weight_reset.is_none() {
            return true;
        }
        if let Some(next_voter_weight_reset_time) = self.next_voter_weight_reset_time {
            clock.unix_timestamp < next_voter_weight_reset_time
                && self.updated_temporary_members == self.temporary_members
        } else {
            false
        }
    }
}
