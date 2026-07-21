use anchor_lang::prelude::*;
use spl_governance::state::realm;

use crate::error::Error;
use crate::events::root::{MaxProposalLifetimeChanged, Paused, Resumed, VoterWeightResetChanged};
use crate::state::{Root, VoterWeightReset};
use anchor_lang::error::Error as AnchorError;

#[derive(Accounts)]
pub struct ConfigureRoot<'info> {
    #[account(
        mut,
        has_one = realm,
    )]
    pub(crate) root: Account<'info, Root>,
    /// CHECK: dynamic owner ID
    #[account(
        owner = root.governance_program,
    )]
    pub(crate) realm: UncheckedAccount<'info>,
    pub(crate) realm_authority: Signer<'info>,
}

impl<'info> ConfigureRoot<'info> {
    pub(crate) fn check_authority(&self) -> Result<()> {
        let realm = realm::get_realm_data_for_governing_token_mint(
            &self.root.governance_program,
            &self.realm.to_account_info(),
            &self.root.governing_token_mint,
        )
        .map_err(|e| {
            AnchorError::from(e)
                .with_source(source!())
                .with_account_name("realm")
        })?;

        require_keys_eq!(
            realm.authority.ok_or(error!(Error::EmptyRealmAuthority))?,
            self.realm_authority.key(),
            Error::WrongRealmAuthority
        );

        Ok(())
    }
    pub fn set_max_proposal_lifetime(&mut self, new_max_proposal_lifetime: u64) -> Result<()> {
        self.check_authority()?;

        let old_max_proposal_lifetime = self.root.max_proposal_lifetime;
        self.root.max_proposal_lifetime = new_max_proposal_lifetime;
        if new_max_proposal_lifetime != old_max_proposal_lifetime {
            emit!(MaxProposalLifetimeChanged {
                root: self.root.key(),
                old_max_proposal_lifetime,
                new_max_proposal_lifetime
            });
        }
        Ok(())
    }

    pub fn set_voter_weight_reset(
        &mut self,
        new_step: u64,
        new_next_reset_time: Option<i64>,
    ) -> Result<()> {
        self.check_authority()?;

        let old_voter_weight_reset = self.root.voter_weight_reset.clone();
        if let Some(VoterWeightReset {
            step,
            next_reset_time,
        }) = &mut self.root.voter_weight_reset
        {
            require!(
                new_next_reset_time.is_none(),
                Error::CanNotChangeNextResetTime
            );
            // Check the next reset time is not overflowing
            let _ = *next_reset_time + new_step as i64;
            *step = new_step;
        } else {
            require_neq!(new_step, 0, Error::InvalidResetStep);
            let current_time = Clock::get()?.unix_timestamp;
            let next_reset_time = new_next_reset_time.unwrap_or(current_time + new_step as i64);
            require_gt!(next_reset_time, current_time, Error::InvalidNextResetTime);
            self.root.voter_weight_reset = Some(VoterWeightReset {
                next_reset_time,
                step: new_step,
            });
            // Check the next reset time is not overflowing
            let _ = next_reset_time + new_step as i64;
        }
        emit!(VoterWeightResetChanged {
            root: self.root.key(),
            old_voter_weight_reset,
            new_voter_weight_reset: self.root.voter_weight_reset.clone()
        });
        Ok(())
    }

    pub fn pause(&mut self) -> Result<()> {
        self.check_authority()?;
        let old_paused = self.root.paused;
        self.root.paused = true;
        if !old_paused {
            emit!(Paused {
                root: self.root.key(),
            })
        }
        Ok(())
    }

    pub fn resume(&mut self) -> Result<()> {
        self.check_authority()?;
        let old_paused = self.root.paused;
        self.root.paused = false;
        if old_paused {
            emit!(Resumed {
                root: self.root.key(),
            })
        }
        Ok(())
    }
}
