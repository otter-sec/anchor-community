use anchor_lang::{prelude::*, solana_program::program::invoke_signed};

use crate::{
    error::Error,
    events::clan::ClanVotingDelegateChanged,
    state::{Clan, Root},
};
use anchor_lang::error::Error as AnchorError;
use spl_governance::{
    instruction::set_governance_delegate, state::token_owner_record::get_token_owner_record_data,
    PROGRAM_AUTHORITY_SEED,
};

#[derive(Accounts)]
pub struct SetVotingDelegate<'info> {
    #[account(
        mut,
        has_one = root,
    )]
    clan: Account<'info, Clan>,
    #[account(
        constraint = clan_authority.key() == clan.owner ||
            clan_authority.key() == clan.delegate
        @ Error::WrongClanAuthority,
    )]
    clan_authority: Signer<'info>,
    #[account(
        has_one = governance_program,
    )]
    root: Account<'info, Root>,
    /// CHECK: PDA
    #[account(
        seeds = [
            Clan::VOTER_AUTHORITY_SEED,
            &clan.key().to_bytes()
        ],
        bump = clan.bumps.voter_authority,
    )]
    voter_authority: UncheckedAccount<'info>,
    /// CHECK: dynamic owner
    #[account(
        mut,
        owner = governance_program.key(),
        seeds = [
            PROGRAM_AUTHORITY_SEED,
            &root.realm.to_bytes(),
            &root.governing_token_mint.key().to_bytes(),
            &voter_authority.key.to_bytes(),
        ],
        bump = clan.bumps.token_owner_record,
        seeds::program = root.governance_program,
        address = clan.token_owner_record,
    )]
    clan_tor: UncheckedAccount<'info>,

    /// CHECK: program
    #[account(executable)]
    governance_program: UncheckedAccount<'info>,
}

impl<'info> SetVotingDelegate<'info> {
    pub fn process(&mut self, new_voting_delegate: Pubkey) -> Result<()> {
        let old_voting_delegate = get_token_owner_record_data(
            self.governance_program.key,
            &self.clan_tor.to_account_info(),
        )
        .map_err(|e| {
            AnchorError::from(e)
                .with_source(source!())
                .with_account_name("clan_tor")
        })?
        .governance_delegate;
        let new_voting_delegate = if new_voting_delegate == Pubkey::default() {
            None
        } else {
            Some(new_voting_delegate)
        };

        invoke_signed(
            &set_governance_delegate(
                self.governance_program.key,
                self.voter_authority.key,
                &self.root.realm,
                &self.root.governing_token_mint,
                self.voter_authority.key,
                &new_voting_delegate,
            ),
            &[
                self.governance_program.to_account_info(),
                self.voter_authority.to_account_info(),
                self.clan_tor.to_account_info(),
            ],
            &[&[
                Clan::VOTER_AUTHORITY_SEED,
                &self.clan.key().to_bytes(),
                &[self.clan.bumps.voter_authority],
            ]],
        )?;
        emit!(ClanVotingDelegateChanged {
            clan: self.clan.key(),
            new_voting_delegate,
            old_voting_delegate,
        });
        Ok(())
    }
}
