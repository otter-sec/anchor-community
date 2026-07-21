use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_program},
};
use anchor_spl::token::Mint;
use spl_governance::{PROGRAM_AUTHORITY_SEED, instruction::create_token_owner_record};

use crate::{state::{Clan, Root, VoterWeightRecord, ClanBumps}, events::clan::ClanCreated};


#[derive(Accounts)]
pub struct CreateClan<'info> {
    #[account(
        mut,
        has_one = realm,
        has_one = governing_token_mint,
        has_one = governance_program,
    )]
    root: Account<'info, Root>,

    /// CHECK: dynamic owner
    #[account(
        owner = governance_program.key(),
    )]
    realm: UncheckedAccount<'info>,
    governing_token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = Clan::SPACE,
    )]
    clan: Account<'info, Clan>,

    /// CHECK: PDA
    #[account(
        seeds = [
            Clan::VOTER_AUTHORITY_SEED,
            &clan.key().to_bytes()
        ],
        bump
    )]
    voter_authority: UncheckedAccount<'info>,

    /// CHECK: dynamic owner
    #[account(
        mut,
        seeds = [
            PROGRAM_AUTHORITY_SEED,
            &realm.key.to_bytes(),
            &root.governing_token_mint.key().to_bytes(),
            &voter_authority.key.to_bytes(),
        ],
        seeds::program = root.governance_program,
        bump
    )]
    clan_tor: UncheckedAccount<'info>, // will be created

    /// The voter weight record is the account that will be shown to spl-governance
    /// to prove how much vote weight the voter has. See update_voter_weight_record.
    #[account(
        init,
        seeds = [
            VoterWeightRecord::ADDRESS_SEED,
            &clan.key().to_bytes()
        ],
        bump,
        payer = payer,
        space = VoterWeightRecord::SPACE,
    )]
    clan_vwr: Box<Account<'info, VoterWeightRecord>>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    payer: Signer<'info>,

    system_program: Program<'info, System>,
    /// CHECK: program
    #[account(
        executable,
    )]
    governance_program: UncheckedAccount<'info>,
}

impl<'info> CreateClan<'info> {
    pub fn process(&mut self, owner: Pubkey, bumps: CreateClanBumps) -> Result<()> {
        let clock = Clock::get()?;
        self.root.update_next_voter_weight_reset_time(&clock);

        self.clan.set_inner(Clan {
            root: self.root.key(),
            owner,
            delegate: Pubkey::default(),
            voter_authority: self.voter_authority.key(),
            token_owner_record: self.clan_tor.key(),
            voter_weight_record: self.clan_vwr.key(),
            min_voting_weight_to_join: 0,
            permanent_members: 0,
            temporary_members: 0,
            updated_temporary_members: 0,
            leaving_members: 0,
            accept_temporary_members: true,
            permanent_voter_weight: 0,
            next_voter_weight_reset_time: self.root.next_voter_weight_reset_time(),
            name: "".to_owned(),
            description: "".to_owned(),
            bumps: ClanBumps {
                voter_authority: bumps.voter_authority,
                token_owner_record: bumps.clan_tor,
                voter_weight_record: bumps.clan_vwr,
            },
        });
        invoke(
            &create_token_owner_record(
                &self.root.governance_program,
                &self.root.realm,
                &self.voter_authority.key(),
                &self.root.governing_token_mint,
                &self.payer.key(),
            ),
            &[
                self.realm.to_account_info(),
                self.voter_authority.to_account_info(),
                self.clan_tor.to_account_info(),
                self.governing_token_mint.to_account_info(),
                self.payer.to_account_info(),
                self.system_program.to_account_info(),
                self.governance_program.to_account_info(),
            ],
        )?;
        self.clan_vwr.set_inner(VoterWeightRecord::new(
            self.realm.key(),
            self.root.governing_token_mint,
            self.voter_authority.key(),
            0,
            None,
            None,
            None,
        ));
        emit!(ClanCreated {
            clan: self.clan.key(),
            root: self.root.key(),
            clan_index: self.root.clan_count,
            owner,
        });
        self.root.clan_count += 1;
        Ok(())
    }
}
