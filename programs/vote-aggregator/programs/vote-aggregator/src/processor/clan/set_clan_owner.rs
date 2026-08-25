use anchor_lang::prelude::*;

use crate::events::clan::ClanOwnerChanged;
use crate::state::Clan;

#[derive(Accounts)]
pub struct SetClanOwner<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    clan: Account<'info, Clan>,
    owner: Signer<'info>,
}

impl <'info> SetClanOwner<'info> {
    pub fn process(&mut self, owner: Pubkey) -> Result<()> {
        let old_owner = self.clan.owner;
        self.clan.owner = owner;
        emit!(ClanOwnerChanged {
            clan: self.clan.key(),
            old_owner,
            new_owner: owner,
        });
        Ok(())
    }
}