use anchor_lang::{prelude::*, solana_program::system_program};
use anchor_spl::token::Mint;
use spl_governance::state::{realm, realm_config::get_realm_config_data_for_realm};

use crate::{
    error::Error,
    events::root::RootCreated,
    program::VoteAggregator,
    state::{
        root::{Root, RootBumps},
        MaxVoterWeightRecord,
    },
};
use anchor_lang::error::Error as AnchorError;

#[derive(Accounts)]
pub struct CreateRoot<'info> {
    #[account(
        init,
        seeds = [
            Root::ADDRESS_SEED,
            &realm.key.to_bytes(),
            &governing_token_mint.key().to_bytes()
        ],
        bump,
        payer = payer,
        space = Root::SPACE,
    )]
    root: Account<'info, Root>,

    /// CHECK: An spl-governance realm (dynamic owner ID)
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

    /// Either the realm community mint or the council mint.
    governing_token_mint: Account<'info, Mint>,
    realm_authority: Signer<'info>,
    #[account(
        init,
        seeds = [
            MaxVoterWeightRecord::ADDRESS_SEED,
            &root.key().to_bytes()
        ],
        bump,
        payer = payer,
        space = MaxVoterWeightRecord::SPACE,
    )]
    max_vwr: Account<'info, MaxVoterWeightRecord>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    payer: Signer<'info>,

    /// CHECK: program
    #[account(executable)]
    governance_program: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
    // self reference to be used as a plugin in SPL-governance
    vote_aggregator_program: Program<'info, VoteAggregator>,
}

impl<'info> CreateRoot<'info> {
    pub fn process(&mut self, max_proposal_lifetime: u64, bumps: CreateRootBumps) -> Result<()> {
        // Verify that "realm_authority" is the expected authority on "realm"
        // and that the mint matches one of the realm mints too.
        let realm = realm::get_realm_data_for_governing_token_mint(
            self.governance_program.key,
            &self.realm.to_account_info(),
            &self.governing_token_mint.key(),
        )
        .map_err(|e| {
            AnchorError::from(e)
                .with_source(source!())
                .with_account_name("realm")
        })?;

        let realm_config = get_realm_config_data_for_realm(
            self.governance_program.key,
            &self.realm_config.to_account_info(),
            self.realm.key,
        )
        .map_err(|e| {
            AnchorError::from(e)
                .with_source(source!())
                .with_account_name("realm_config")
        })?;

        require_keys_eq!(
            realm.authority.ok_or(error!(Error::EmptyRealmAuthority))?,
            self.realm_authority.key(),
            Error::WrongRealmAuthority
        );

        let voting_weight_plugin = if self.governing_token_mint.key() == realm.community_mint {
            realm_config.community_token_config.voter_weight_addin
        } else {
            realm_config.council_token_config.voter_weight_addin
        };

        let (lock_authority, lock_authority_bump) = Pubkey::find_program_address(
            &[Root::LOCK_AUTHORITY_SEED, &self.root.key().to_bytes()],
            &crate::ID,
        );
        msg!("lock_authority: {:?}", lock_authority);

        self.root.set_inner(Root {
            governance_program: self.governance_program.key(),
            realm: self.realm.key(),
            governing_token_mint: self.governing_token_mint.key(),
            voting_weight_plugin: voting_weight_plugin.unwrap_or_default(),
            max_proposal_lifetime,
            voter_weight_reset: None,
            paused: false,
            clan_count: 0,
            member_count: 0,
            bumps: RootBumps {
                root: bumps.root,
                max_voter_weight: bumps.max_vwr,
                lock_authority: lock_authority_bump,
            },
        });

        self.max_vwr.set_inner(MaxVoterWeightRecord::new(
            self.realm.key(),
            self.governing_token_mint.key(),
        ));

        emit!(RootCreated {
            root: self.root.key(),
            governance_program: self.governance_program.key(),
            realm: self.realm.key(),
            governing_token_mint: self.governing_token_mint.key(),
            voting_weight_plugin,
        });
        Ok(())
    }
}
