use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod processor;
pub mod state;

use processor::*;

declare_id!("VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT");
/*
#[derive(Accounts)]
pub struct DestroyAccount<'info> {
    /// CHECK: The account to destroy.
    #[account(
        mut,
    )]
    pub account: UncheckedAccount<'info>,

    #[account(
        mut,
    )]
    pub rent_collector: SystemAccount<'info>,
}
*/

#[program]
pub mod vote_aggregator {
    use super::*;

    pub fn create_root(ctx: Context<CreateRoot>, max_proposal_lifetime: u64) -> Result<()> {
        ctx.accounts.process(max_proposal_lifetime, ctx.bumps)
    }

    pub fn update_root(ctx: Context<UpdateRoot>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn set_max_proposal_lifetime(
        ctx: Context<ConfigureRoot>,
        new_max_proposal_lifetime: u64,
    ) -> Result<()> {
        ctx.accounts
            .set_max_proposal_lifetime(new_max_proposal_lifetime)
    }

    pub fn set_voter_weight_reset(
        ctx: Context<ConfigureRoot>,
        new_step: u64,
        new_next_reset_time: Option<i64>,
    ) -> Result<()> {
        ctx.accounts
            .set_voter_weight_reset(new_step, new_next_reset_time)
    }

    pub fn pause(ctx: Context<ConfigureRoot>) -> Result<()> {
        ctx.accounts.pause()
    }

    pub fn resume(ctx: Context<ConfigureRoot>) -> Result<()> {
        ctx.accounts.resume()
    }

    pub fn set_voter_weight_plugin(
        ctx: Context<SetVotingWeightPlugin>,
        new_voting_weight_plugin: Pubkey,
    ) -> Result<()> {
        ctx.accounts.process(new_voting_weight_plugin)
    }

    pub fn create_clan(ctx: Context<CreateClan>, owner: Pubkey) -> Result<()> {
        ctx.accounts.process(owner, ctx.bumps)
    }

    pub fn update_clan(ctx: Context<UpdateClan>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn set_clan_owner(ctx: Context<SetClanOwner>, owner: Pubkey) -> Result<()> {
        ctx.accounts.process(owner)
    }

    pub fn resize_clan(ctx: Context<ResizeClan>, size: u32) -> Result<()> {
        ctx.accounts.process(size)
    }

    pub fn set_clan_delegate(ctx: Context<ConfigureClan>, new_delegate: Pubkey) -> Result<()> {
        ctx.accounts.set_delegate(new_delegate)
    }

    pub fn set_clan_name(ctx: Context<ConfigureClan>, name: String) -> Result<()> {
        ctx.accounts.set_name(name)
    }

    pub fn set_clan_description(ctx: Context<ConfigureClan>, description: String) -> Result<()> {
        ctx.accounts.set_description(description)
    }

    pub fn set_clan_min_voting_weight_to_join(
        ctx: Context<ConfigureClan>,
        min_voting_weight_to_join: u64,
    ) -> Result<()> {
        ctx.accounts
            .set_min_voting_weight_to_join(min_voting_weight_to_join)
    }

    pub fn set_clan_accept_temporary_members(
        ctx: Context<ConfigureClan>,
        accept_temporary_members: bool,
    ) -> Result<()> {
        ctx.accounts
            .set_accept_temporary_members(accept_temporary_members)
    }

    pub fn update_proposal_vote(ctx: Context<UpdateProposalVote>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn forced_cancel_proposal(ctx: Context<ForcedCancelProposal>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn set_voting_delegate(
        ctx: Context<SetVotingDelegate>,
        new_voting_delegate: Pubkey,
    ) -> Result<()> {
        ctx.accounts.process(new_voting_delegate)
    }

    pub fn create_member(ctx: Context<CreateMember>) -> Result<()> {
        ctx.accounts.process(ctx.bumps)
    }

    pub fn join_clan<'a, 'b, 'c: 'info, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, JoinClan<'info>>,
        share_bp: u16,
    ) -> Result<()> {
        ctx.accounts.process(share_bp, ctx.remaining_accounts)
    }

    pub fn start_leaving_clan(ctx: Context<StartLeavingClan>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn exit_clan(ctx: Context<ExitClan>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn update_voter_weight<'a, 'b, 'c: 'info, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, UpdateVoterWeight<'info>>,
    ) -> Result<()> {
        ctx.accounts.process(ctx.remaining_accounts)
    }

    pub fn set_voter_weight_record<'a, 'b, 'c: 'info, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, SetVoterWeightRecord<'info>>,
    ) -> Result<()> {
        ctx.accounts.process(ctx.remaining_accounts)
    }

    /*
    pub fn destroy_account(ctx: Context<DestroyAccount>) -> Result<()> {
        let l = ctx.accounts.account.lamports();
        ctx.accounts.account.sub_lamports(l)?;
        ctx.accounts.rent_collector.add_lamports(l)?;
        Ok(())
    }
    */
}
