use anchor_lang::prelude::*;

use crate::error::Error;
use crate::events::clan::{
    ClanAcceptTemporaryMembersChanged, ClanDelegateChanged, ClanDescriptionChanged,
    ClanMinVotingWeightToJoinChanged, ClanNameChanged,
};
use crate::state::Clan;

#[derive(Accounts)]
pub struct ConfigureClan<'info> {
    #[account(mut)]
    clan: Account<'info, Clan>,

    #[account(
        constraint = clan_authority.key() == clan.owner ||
            clan_authority.key() == clan.delegate
        @ Error::WrongClanAuthority,
    )]
    clan_authority: Signer<'info>,
}

impl<'info> ConfigureClan<'info> {
    pub fn set_delegate(&mut self, new_delegate: Pubkey) -> Result<()> {
        let old_delegate = self.clan.delegate;
        self.clan.delegate = new_delegate;
        if new_delegate != old_delegate {
            emit!(ClanDelegateChanged {
                clan: self.clan.key(),
                old_delegate,
                new_delegate,
            });
        }
        Ok(())
    }

    pub fn set_name(&mut self, new_name: String) -> Result<()> {
        let old_name = self.clan.name.clone();
        self.clan.name = new_name.clone();
        if new_name != old_name {
            emit!(ClanNameChanged {
                clan: self.clan.key(),
                old_name,
                new_name,
            });
        }
        Ok(())
    }

    pub fn set_description(&mut self, new_description: String) -> Result<()> {
        let old_description = self.clan.description.clone();
        self.clan.description = new_description.clone();
        if new_description != old_description {
            emit!(ClanDescriptionChanged {
                clan: self.clan.key(),
                old_description,
                new_description,
            });
        }
        Ok(())
    }

    pub fn set_min_voting_weight_to_join(
        &mut self,
        new_min_voting_weight_to_join: u64,
    ) -> Result<()> {
        let old_min_voting_weight_to_join = self.clan.min_voting_weight_to_join;
        self.clan.min_voting_weight_to_join = new_min_voting_weight_to_join;
        if new_min_voting_weight_to_join != old_min_voting_weight_to_join {
            emit!(ClanMinVotingWeightToJoinChanged {
                clan: self.clan.key(),
                old_min_voting_weight_to_join,
                new_min_voting_weight_to_join,
            });
        }
        Ok(())
    }

    pub fn set_accept_temporary_members(
        &mut self,
        new_accept_temporary_members: bool,
    ) -> Result<()> {
        let old_accept_temporary_members = self.clan.accept_temporary_members;
        self.clan.accept_temporary_members = new_accept_temporary_members;
        if new_accept_temporary_members != old_accept_temporary_members {
            emit!(ClanAcceptTemporaryMembersChanged {
                clan: self.clan.key(),
                old_accept_temporary_members,
                new_accept_temporary_members,
            });
        }
        Ok(())
    }
}
