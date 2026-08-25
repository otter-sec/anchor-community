use anchor_lang::prelude::*;

use crate::{
    error::Error,
    events::member::StartingLeavingClan,
    state::{Clan, Member, Root, VoterWeightRecord},
};

#[derive(Accounts)]
pub struct StartLeavingClan<'info> {
    #[account(
        mut,
        has_one = root,
    )]
    member: Account<'info, Member>,
    #[account(mut)]
    root: Account<'info, Root>,
    #[account(
        mut,
        has_one = root,
    )]
    clan: Account<'info, Clan>,
    #[account(
        mut,
        seeds = [
            VoterWeightRecord::ADDRESS_SEED,
            &clan.key().to_bytes()
        ],
        bump = clan.bumps.voter_weight_record,
    )]
    clan_vwr: Box<Account<'info, VoterWeightRecord>>,
    #[account(
        constraint = member_authority.key() == member.owner ||
            member_authority.key() == member.delegate
        @ Error::WrongMemberAuthority
    )]
    member_authority: Signer<'info>,
}

impl<'info> StartLeavingClan<'info> {
    pub fn process(&mut self) -> Result<()> {
        let entry = self
            .member
            .membership
            .iter_mut()
            .find(|entry| entry.clan == self.clan.key())
            .ok_or(error!(Error::UnexpectedClan))?;
        require!(entry.exitable_at.is_none(), Error::RerequestingLeavingClan);

        let clock = Clock::get()?;
        entry.exitable_at =
            Some(clock.unix_timestamp + i64::try_from(self.root.max_proposal_lifetime).unwrap());

        self.root.update_next_voter_weight_reset_time(&clock);
        self.clan
            .reset_voter_weight_if_needed(&mut self.root, &mut self.clan_vwr);
        let share_bp = entry.share_bp;
        Clan::update_member(
            &mut self.clan,
            &self.member,
            Some(share_bp),
            None,
            None, // Leaving the clan
            &mut self.clan_vwr,
            &clock,
        )?;
        self.clan.leaving_members += 1;
        emit!(StartingLeavingClan {
            member: self.member.key(),
            clan: self.clan.key(),
            root: self.root.key(),
            owner: self.member.owner,
        });
        Ok(())
    }
}
