use anchor_lang::prelude::*;
use spl_governance::addins::voter_weight::get_voter_weight_record_data;
use spl_governance_addin_api::voter_weight::VoterWeightRecord as SplVoterWeightRecord;

use crate::error::Error;
use crate::state::{MaxVoterWeightRecord, Member, Root};

#[derive(Accounts)]
pub struct UpdateVoterWeight<'info> {
    #[account(
        mut,
        has_one = root,
    )]
    member: Account<'info, Member>,

    /// CHECK: dynamic owner
    #[account(
        owner = root.voting_weight_plugin,
        address = member.voter_weight_record,
    )]
    member_vwr: Option<UncheckedAccount<'info>>,

    #[account(mut)]
    root: Account<'info, Root>,
    #[account(
        mut,
        seeds = [
            MaxVoterWeightRecord::ADDRESS_SEED,
            &root.key().to_bytes()
        ],
        bump = root.bumps.max_voter_weight,
    )]
    max_vwr: Account<'info, MaxVoterWeightRecord>,
}

impl<'info> UpdateVoterWeight<'info> {
    pub fn process<'c: 'info>(&mut self, rest: &'c [AccountInfo<'info>]) -> Result<()> {
        let new_member_vwr = if let Some(member_vwr) = self.member_vwr.as_ref() {
            require!(!self.root.paused, Error::Paused);
            let new_member_vwr = get_voter_weight_record_data(
                &self.root.voting_weight_plugin,
                member_vwr,
            )
            .map_err(|e| {
                ProgramErrorWithOrigin::from(e).with_account_name("member_voter_weight_record")
            })?;
            require_keys_eq!(new_member_vwr.realm, self.root.realm);
            require_keys_eq!(
                new_member_vwr.governing_token_mint,
                self.root.governing_token_mint
            );
            require_keys_eq!(new_member_vwr.governing_token_owner, self.member.owner);
            new_member_vwr
        } else {
            require!(self.root.paused, Error::MemberVwrRequired);

            SplVoterWeightRecord {
                account_discriminator: SplVoterWeightRecord::ACCOUNT_DISCRIMINATOR,
                realm: self.root.realm,
                governing_token_mint: self.root.governing_token_mint,
                governing_token_owner: self.member.owner,
                voter_weight: 0,
                voter_weight_expiry: None,
                weight_action: None,
                weight_action_target: None,
                reserved: [0; 8],
            }
        };

        let clock = Clock::get()?;
        self.root.update_next_voter_weight_reset_time(&clock);
        for (mut chunk, entry) in self.member.load_clan_chunks(rest, |_| true)? {
            self.member.refresh_membership(
                &mut self.root,
                entry,
                &mut chunk,
                &new_member_vwr,
                &clock,
            )?;
            chunk.exit(&crate::ID)?;
        }

        let member_vwr_key = self.member.voter_weight_record;
        Member::update_voter_weight(
            &mut self.member,
            member_vwr_key,
            &new_member_vwr,
            &mut self.max_vwr,
        )?;
        self.member.next_voter_weight_reset_time = self.root.next_voter_weight_reset_time();

        Ok(())
    }
}
