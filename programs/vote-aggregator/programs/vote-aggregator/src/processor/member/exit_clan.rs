use anchor_lang::prelude::*;
use spl_governance::{
    instruction::relinquish_token_owner_record_locks, solana_program::program::invoke_signed,
    state::token_owner_record::get_token_owner_record_data_for_realm_and_governing_mint,
    PROGRAM_AUTHORITY_SEED,
};

use crate::{
    error::Error,
    events::clan::ClanMemberLeft,
    state::{Clan, Member, Root},
};

#[derive(Accounts)]
pub struct ExitClan<'info> {
    #[account(
        mut,
        has_one = root,
    )]
    member: Account<'info, Member>,
    #[account(
        mut,
        has_one = root,
    )]
    clan: Account<'info, Clan>,

    #[account(
        constraint = member_authority.key() == member.owner ||
            member_authority.key() == member.delegate
        @ Error::WrongMemberAuthority
    )]
    member_authority: Signer<'info>,

    /// CHECK: dynamic owner
    #[account(
        mut,
        seeds = [
            PROGRAM_AUTHORITY_SEED,
            &root.realm.to_bytes(),
            &root.governing_token_mint.to_bytes(),
            &member.owner.key().to_bytes(),
        ],
        seeds::program = governance_program.key(),
        bump = member.bumps.token_owner_record,
        address = member.token_owner_record,
    )]
    member_tor: UncheckedAccount<'info>,

    #[account(
        has_one = governance_program,
        has_one = realm,
    )]
    root: Account<'info, Root>,

    /// CHECK: dynamic owner
    #[account(
        owner = governance_program.key(),
    )]
    realm: UncheckedAccount<'info>,

    /// CHECK: dynamic owner
    #[account(
        owner = governance_program.key(),
        seeds = [
            b"realm-config",
            &realm.key.to_bytes()
        ],
        bump,
        seeds::program = governance_program.key(),
    )]
    realm_config: UncheckedAccount<'info>,

    /// CHECK: PDA
    #[account(
        seeds = [
        Root::LOCK_AUTHORITY_SEED,
            &root.key().to_bytes()
        ],
        bump = root.bumps.lock_authority,
    )]
    lock_authority: UncheckedAccount<'info>,

    /// CHECK: program
    #[account(executable)]
    governance_program: UncheckedAccount<'info>,

    /// CHECK: dynamic owner
    #[account(
        mut,
        seeds = [
            PROGRAM_AUTHORITY_SEED,
            &root.realm.to_bytes(),
            &root.governing_token_mint.key().to_bytes(),
            &Pubkey::create_program_address(&[
                Clan::VOTER_AUTHORITY_SEED,
                &clan.key().to_bytes(),
                &[clan.bumps.voter_authority]
            ], &crate::ID).expect("Voter authority PDA constructing").to_bytes(),
        ],
        seeds::program = root.governance_program,
        bump = clan.bumps.token_owner_record
    )]
    clan_tor: Option<UncheckedAccount<'info>>,
}

impl<'info> ExitClan<'info> {
    pub fn process(&mut self) -> Result<()> {
        let (index, entry) = self
            .member
            .membership
            .iter()
            .enumerate()
            .find(|(_, entry)| entry.clan == self.clan.key())
            .ok_or(error!(Error::UnexpectedExitingClan))?;
        let leaving_time = entry
            .exitable_at
            .ok_or(error!(Error::UnexpectedExitingClan))?;
        let clock = Clock::get()?;

        let safe_to_exit = if let Some(clan_tor) = self.clan_tor.as_ref() {
            let clan_tor = get_token_owner_record_data_for_realm_and_governing_mint(
                &self.root.governance_program,
                &clan_tor.to_account_info(),
                &self.root.realm,
                &self.root.governing_token_mint,
            )
            .map_err(|e| ProgramErrorWithOrigin::from(e).with_account_name("clan_tor"))?;

            clan_tor.unrelinquished_votes_count == 0 && clan_tor.outstanding_proposal_count == 0
        } else {
            false
        };

        if !safe_to_exit {
            require_gte!(
                clock.unix_timestamp,
                leaving_time,
                Error::TooEarlyToExitClan
            );
        }

        self.member.membership.remove(index);
        self.clan.leaving_members -= 1;

        if self.member.membership.is_empty() {
            invoke_signed(
                &relinquish_token_owner_record_locks(
                    self.governance_program.key,
                    self.realm.key,
                    self.member_tor.key,
                    Some(self.lock_authority.key()),
                    Some(vec![0]),
                ),
                &[
                    self.realm.to_account_info(),
                    self.realm_config.to_account_info(),
                    self.governance_program.to_account_info(),
                    self.member_tor.to_account_info(),
                    self.lock_authority.to_account_info(),
                ],
                &[&[
                    Root::LOCK_AUTHORITY_SEED,
                    &self.root.key().to_bytes(),
                    &[self.root.bumps.lock_authority],
                ]],
            )?;
        }

        emit!(ClanMemberLeft {
            member: self.member.key(),
            clan: self.clan.key(),
            root: self.root.key(),
            owner: self.member.owner,
        });
        Ok(())
    }
}
