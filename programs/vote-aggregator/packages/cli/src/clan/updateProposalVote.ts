import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parsePubkey} from '../keyParser';
import {
  getGovernance,
  getProposal,
  getVoteRecord,
  getVoteRecordAddress,
  getVoteRecordsByVoter,
  ProgramAccount,
  Proposal,
  ProposalState,
} from '@solana/spl-governance';

export const installUpdateProposalVoteCLI = (program: Command) => {
  program
    .command('update-proposal-vote')
    .requiredOption('--clan <pubkey>', 'Clan address')
    .option('--proposal <pubkey>', 'Proposal')
    .action(updateProposalVote);
};

const updateProposalVote = async ({
  clan,
  proposal,
}: {
  clan: string;
  proposal?: string;
}) => {
  const {sdk, provider} = context!;
  const clanAddress = await parsePubkey(clan);
  const proposals: ProgramAccount<Proposal>[] = [];
  const clanData = await sdk.clan.fetchClan(clanAddress);
  const root = await sdk.root.fetchRoot(clanData.root);
  const clanTokenOwner = await sdk.clan.fetchTokenOwnerRecord({
    rootData: root,
    clanAddress,
  });
  const clanVoterWeightRecord = await sdk.clan.fetchVoterWeight({
    clanAddress,
  });
  const [clanVotingAuthority] = sdk.clan.voterAuthority({clanAddress});

  if (proposal) {
    const pubkey = await parsePubkey(proposal);
    const proposalData = await getProposal(provider.connection, pubkey);
    const {account: governance} = await getGovernance(
      provider.connection,
      proposalData.account.governance
    );
    const vote = await getVoteRecord(
      provider.connection,
      await getVoteRecordAddress(
        root.governanceProgram,
        pubkey,
        clanTokenOwner.publicKey
      )
    );
    if (vote.account.voterWeight?.eq(clanVoterWeightRecord.voterWeight)) {
      console.log('No need to update vote');
      return;
    }
    if (
      proposalData.account.state !== ProposalState.Voting ||
      proposalData.account.hasVoteTimeEnded(governance)
    ) {
      throw new Error('Proposal is not in voting state');
    }
    proposals.push(proposalData);
  } else {
    const votes = await getVoteRecordsByVoter(
      provider.connection,
      root.governanceProgram,
      clanVotingAuthority
    );
    for (const vote of votes) {
      if (
        vote.account.isRelinquished ||
        vote.account.voterWeight?.eq(clanVoterWeightRecord.voterWeight)
      ) {
        continue;
      }
      const proposalData = await getProposal(
        provider.connection,
        vote.account.proposal
      );
      const {account: governance} = await getGovernance(
        provider.connection,
        proposalData.account.governance
      );
      if (
        proposalData.account.state !== ProposalState.Voting ||
        proposalData.account.hasVoteTimeEnded(governance)
      ) {
        continue;
      }
      proposals.push(proposalData);
    }
  }

  if (proposals.length === 0) {
    console.log('No proposals to update');
    return;
  }

  await execute({
    instructions: await Promise.all(
      proposals.map(async proposal => {
        return await sdk.clan.udpateProposalVote({
          rootAddress: clanData.root,
          rootData: root,
          clanAddress,
          governance: proposal.account.governance,
          proposal: proposal.pubkey,
          proposalOwnerRecord: proposal.account.tokenOwnerRecord,
          payer: provider.publicKey!,
        });
      })
    ),
  });
};
