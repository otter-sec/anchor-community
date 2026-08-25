use anchor_lang::prelude::*;

use crate::state::{Clan, Root, VoterWeightRecord};

#[derive(Accounts)]
pub struct UpdateClan<'info> {
    #[account(mut)]
    root: Account<'info, Root>,

    #[account(mut)]
    clan: Account<'info, Clan>,

    #[account(mut)]
    clan_wvr: Account<'info, VoterWeightRecord>,
}

impl<'info> UpdateClan<'info> {
    pub fn process(&mut self) -> Result<()> {
        let clock = Clock::get()?;
        self.root.update_next_voter_weight_reset_time(&clock);
        self.clan
            .reset_voter_weight_if_needed(&mut self.root, &mut self.clan_wvr);
        Ok(())
    }
}
