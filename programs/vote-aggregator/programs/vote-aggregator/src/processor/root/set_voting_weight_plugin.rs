use anchor_lang::prelude::*;

use crate::error::Error;
use crate::events::root::VoterWeightPluginChanged;
use crate::state::MaxVoterWeightRecord;

use super::configure_root::*;

#[derive(Accounts)]
pub struct SetVotingWeightPlugin<'info> {
    configure_root: ConfigureRoot<'info>,

    #[account(
        seeds = [
            MaxVoterWeightRecord::ADDRESS_SEED,
            &configure_root.root.key().to_bytes()
        ],
        bump = configure_root.root.bumps.max_voter_weight,
        constraint = max_vwr.max_voter_weight == 0
            @ Error::ResetAllVoterWeightsFirst,
    )]
    max_vwr: Account<'info, MaxVoterWeightRecord>,
}

impl<'info> SetVotingWeightPlugin<'info> {
    pub fn process(&mut self, new_voting_weight_plugin: Pubkey) -> Result<()> {
        self.configure_root.check_authority()?;
        let old_voting_weight_plugin = self.configure_root.root.voting_weight_plugin;
        self.configure_root.root.voting_weight_plugin = new_voting_weight_plugin;
        if new_voting_weight_plugin != old_voting_weight_plugin {
            emit!(VoterWeightPluginChanged {
                root: self.configure_root.root.key(),
                old_voting_weight_plugin,
                new_voting_weight_plugin
            });
        }
        Ok(())
    }
}
