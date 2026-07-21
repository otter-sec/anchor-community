use std::collections::{BTreeMap, BTreeSet};

use anchor_lang::prelude::*;
use spl_governance_addin_api::voter_weight::VoterWeightRecord as SplVoterWeightRecord;

use super::{Clan, MaxVoterWeightRecord, Root, VoterWeightRecord};
use crate::error::Error;
use crate::events::{member::MemberVoterWeightChanged, root::MaxVoterWeightChanged};
use crate::ID;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MemberBumps {
    pub address: u8,
    pub token_owner_record: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MembershipEntry {
    pub clan: Pubkey,
    pub share_bp: u16,
    pub exitable_at: Option<i64>,
}

#[account]
#[derive(Default)]
pub struct Member {
    pub root: Pubkey,     // 8
    pub owner: Pubkey,    // 40
    pub delegate: Pubkey, // 72
    pub token_owner_record: Pubkey,
    pub voter_weight_record: Pubkey,
    pub voter_weight: u64,
    pub voter_weight_expiry: Option<u64>,
    pub next_voter_weight_reset_time: Option<i64>,
    pub membership: Vec<MembershipEntry>,
    pub bumps: MemberBumps,
}

#[derive(Accounts)]
pub struct ClanChunk<'info> {
    #[account(mut)]
    pub clan: Account<'info, Clan>,
    #[account(
        mut,
        seeds = [
            VoterWeightRecord::ADDRESS_SEED,
            &clan.key().to_bytes()
        ],
        bump = clan.bumps.voter_weight_record,
    )]
    pub vwr: Account<'info, VoterWeightRecord>,
}

impl Member {
    pub const SPACE: usize = 8
        + std::mem::size_of::<Self>()
        + Self::MAX_MEMBERSHIP * std::mem::size_of::<MembershipEntry>();
    pub const ADDRESS_SEED: &'static [u8] = b"member";
    pub const MAX_MEMBERSHIP: usize = 16;

    pub fn update_voter_weight<'info>(
        member: &mut Account<'info, Self>,
        member_vwr_key: Pubkey,
        member_vwr: &SplVoterWeightRecord,
        max_vwr: &mut MaxVoterWeightRecord,
    ) -> Result<()> {
        require!(
            member_vwr.weight_action.is_none(),
            Error::UnexpectedWeightAction
        );
        require!(
            member_vwr.weight_action_target.is_none(),
            Error::UnexpectedWeightActionTarget
        );
        let old_voter_weight_record = member.voter_weight_record;
        let old_member_voter_weight = member.voter_weight;
        let old_max_voter_weight = max_vwr.max_voter_weight;
        max_vwr.max_voter_weight -= old_member_voter_weight;
        member.voter_weight_record = member_vwr_key;
        member.voter_weight = member_vwr.voter_weight;
        member.voter_weight_expiry = member_vwr.voter_weight_expiry;
        max_vwr.max_voter_weight += member_vwr.voter_weight;

        emit!(MemberVoterWeightChanged {
            member: member.key(),
            root: member.root.key(),
            old_voter_weight: old_member_voter_weight,
            new_voter_weight: member.voter_weight,
            old_voter_weight_record,
            new_voter_weight_record: member.voter_weight_record,
        });
        emit!(MaxVoterWeightChanged {
            root: member.root.key(),
            old_max_voter_weight,
            new_max_voter_weight: max_vwr.max_voter_weight
        });

        Ok(())
    }

    pub fn load_clan_chunks<'c: 'info, 'info>(
        &self,
        mut rest: &'c [AccountInfo<'info>],
        f: impl Fn(&MembershipEntry) -> bool,
    ) -> Result<Vec<(ClanChunk<'info>, &MembershipEntry)>> {
        let mut missing_clans = self
            .membership
            .iter()
            .filter_map(|entry| {
                if entry.exitable_at.is_none() && f(entry) {
                    Some((entry.clan, entry))
                } else {
                    None
                }
            })
            .collect::<BTreeMap<_, _>>();
        let mut result = Vec::with_capacity(self.membership.len());
        let mut reallocs = BTreeSet::new();
        while !missing_clans.is_empty() {
            if rest.len() < 2 {
                return Err(ProgramError::NotEnoughAccountKeys.into());
            }
            let mut chunk_infos;
            (chunk_infos, rest) = rest.split_at(2);
            let chunk = ClanChunk::try_accounts(
                &ID,
                &mut chunk_infos,
                &[],
                &mut ClanChunkBumps {},
                &mut reallocs,
            )?;
            if let Some(entry) = missing_clans.remove(&chunk.clan.key()) {
                result.push((chunk, entry));
            } else {
                return err!(Error::UnexpectedClan);
            }
        }
        Ok(result)
    }

    pub fn refresh_membership(
        &self,
        root: &mut Root,
        entry: &MembershipEntry,
        ClanChunk {
            clan,
            vwr: clan_vwr,
        }: &mut ClanChunk,
        new_member_vwr: &SplVoterWeightRecord,
        clock: &Clock,
    ) -> Result<()> {
        assert_eq!(entry.clan, clan.key());
        assert!(entry.exitable_at.is_none());
        clan.reset_voter_weight_if_needed(root, clan_vwr);
        Clan::update_member(
            clan,
            self,
            Some(entry.share_bp),
            Some(new_member_vwr),
            Some(entry.share_bp),
            clan_vwr,
            clock,
        )
    }
}
