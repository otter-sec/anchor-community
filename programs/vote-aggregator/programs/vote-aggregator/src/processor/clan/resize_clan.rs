use anchor_lang::{prelude::*, system_program};

use crate::events::clan::ClanResized;
use crate::state::Clan;
use crate::error::Error;

#[derive(Accounts)]
#[instruction(size: u32)]
pub struct ResizeClan<'info> {
    #[account(
        mut,
        realloc = size as usize,
        realloc::payer = payer,
        realloc::zero = false,
    )]
    clan: Account<'info, Clan>,

    #[account(
        constraint = clan_authority.key() == clan.owner ||
            clan_authority.key() == clan.delegate
        @ Error::WrongClanAuthority,
    )]
    clan_authority: Signer<'info>,

    #[account(
        mut,
        owner = system_program::ID
    )]
    payer: Signer<'info>,

    system_program: Program<'info, System>,
}

impl<'info> ResizeClan<'info> {
    pub fn process(&mut self, size: u32) -> Result<()> {
        emit!(ClanResized {
            clan: self.clan.key(),
            new_size: size,
        });
        Ok(())
    }
}