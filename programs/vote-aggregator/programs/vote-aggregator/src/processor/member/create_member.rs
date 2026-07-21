use anchor_lang::{prelude::*, system_program};
use spl_governance::{
    state::token_owner_record::get_token_owner_record_data_for_realm_and_governing_mint,
    PROGRAM_AUTHORITY_SEED,
};

use crate::{
    events::member::MemberCreated,
    state::{Member, MemberBumps, Root},
};

#[derive(Accounts)]
pub struct CreateMember<'info> {
    #[account(
        init,
        seeds = [
            Member::ADDRESS_SEED,
            &root.key().to_bytes(),
            &owner.key().to_bytes()
        ],
        bump,
        payer = payer,
        space = Member::SPACE,
    )]
    member: Account<'info, Member>,
    #[account(mut)]
    root: Account<'info, Root>,
    owner: Signer<'info>,
    #[account(
        mut,
        owner = system_program::ID
    )]
    payer: Signer<'info>,

    /// CHECK: dynamic owner
    #[account(
        seeds = [
            PROGRAM_AUTHORITY_SEED,
            &root.realm.to_bytes(),
            &root.governing_token_mint.to_bytes(),
            &owner.key().to_bytes(),
        ],
        seeds::program = root.governance_program,
        bump,
    )]
    member_tor: UncheckedAccount<'info>,

    system_program: Program<'info, System>,
}

impl<'info> CreateMember<'info> {
    pub fn process(&mut self, bumps: CreateMemberBumps) -> Result<()> {
        // Check TOR
        let member_tor = get_token_owner_record_data_for_realm_and_governing_mint(
            &self.root.governance_program,
            &self.member_tor.to_account_info(),
            &self.root.realm,
            &self.root.governing_token_mint,
        )?;
        require_keys_eq!(member_tor.governing_token_owner, self.owner.key());
        self.member.set_inner(Member {
            root: self.root.key(),
            owner: self.owner.key(),
            delegate: Pubkey::default(),
            token_owner_record: self.member_tor.key(),
            voter_weight_record: Pubkey::default(),
            voter_weight: 0,
            voter_weight_expiry: None,
            next_voter_weight_reset_time: self.root.next_voter_weight_reset_time(),
            membership: vec![],
            bumps: MemberBumps {
                address: bumps.member,
                token_owner_record: bumps.member_tor,
            },
        });
        emit!(MemberCreated {
            member: self.member.key(),
            root: self.root.key(),
            member_index: self.root.member_count,
            owner: self.owner.key(),
        });
        self.root.member_count += 1;
        Ok(())
    }
}
