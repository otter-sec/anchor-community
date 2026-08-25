use anchor_lang::prelude::*;

use crate::state::Root;

#[derive(Accounts)]
pub struct UpdateRoot<'info> {
    #[account(mut)]
    root: Account<'info, Root>,
}

impl<'info> UpdateRoot<'info> {
    pub fn process(&mut self) -> Result<()> {
        let clock = Clock::get()?;
        self.root.update_next_voter_weight_reset_time(&clock);
        Ok(())
    }
}
