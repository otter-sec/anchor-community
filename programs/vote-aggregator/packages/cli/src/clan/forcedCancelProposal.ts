import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parsePubkey} from '../keyParser';
import {
  getAllGovernances,
  getGovernance,
  getProposal,
  getProposalsByGovernance,
  getRealm,
  Governance,
  ProgramAccount,
  Proposal,
} from '@solana/spl-governance';

export const installForcedCancelProposalCLI = (program: Command) => {
  program
    .command('cancel-proposal')
    .requiredOption('--clan <pubkey>', 'Clan address')
    .option('--proposal <pubkey>', 'Proposal')
    .action(forcedCancelProposal);
};

const forcedCancelProposal = async ({
  clan,
  proposal,
}: {
  clan: string;
  proposal?: string;
}) => {
  const {sdk, provider} = context!;
  const clanAddress = await parsePubkey(clan);
  const proposals: {
    data: ProgramAccount<Proposal>;
    governance: Governance;
  }[] = [];
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
  const realm = await getRealm(provider.connection, root.realm);

  if (proposal) {
    const pubkey = await parsePubkey(proposal);
    const proposalData = await getProposal(provider.connection, pubkey);
    const {account: governance} = await getGovernance(
      provider.connection,
      proposalData.account.governance
    );
    if (
      !proposalData.account.tokenOwnerRecord.equals(clanTokenOwner.publicKey)
    ) {
      throw new Error('Proposal does not belong to clan');
    }
    if (
      !proposalData.account.canWalletCancel(
        governance,
        clanTokenOwner.account,
        clanVotingAuthority
      )
    ) {
      throw new Error('Proposal is not cancellable');
    }
    const minTokens = root.governingTokenMint.equals(
      realm.account.communityMint
    )
      ? governance.config.minCommunityTokensToCreateProposal
      : governance.config.minCouncilTokensToCreateProposal;
    if (minTokens.lte(clanVoterWeightRecord.voterWeight)) {
      throw new Error('Proposal does not meet minimum token requirement');
    }
    proposals.push({
      data: proposalData,
      governance,
    });
  } else {
    const governances = await getAllGovernances(
      provider.connection,
      root.governanceProgram,
      root.realm
    );
    for (const governance of governances) {
      const minTokens = root.governingTokenMint.equals(
        realm.account.communityMint
      )
        ? governance.account.config.minCommunityTokensToCreateProposal
        : governance.account.config.minCouncilTokensToCreateProposal;
      if (minTokens.gt(clanVoterWeightRecord.voterWeight)) {
        const governanceProposals = await getProposalsByGovernance(
          provider.connection,
          root.governanceProgram,
          governance.pubkey
        );
        for (const proposalData of governanceProposals) {
          if (
            proposalData.account.tokenOwnerRecord.equals(
              clanTokenOwner.publicKey
            ) &&
            proposalData.account.canWalletCancel(
              governance.account,
              clanTokenOwner.account,
              clanVotingAuthority
            )
          ) {
            proposals.push({
              data: proposalData,
              governance: governance.account,
            });
          }
        }
      }
    }
  }

  if (proposals.length === 0) {
    console.log('No proposals to cancel');
    return;
  }

  await execute({
    instructions: await Promise.all(
      proposals.map(async ({data}) => {
        return await sdk.clan.forcedCancelProposalInstruction({
          rootAddress: clanData.root,
          rootData: root,
          clanAddress,
          governance: data.account.governance,
          proposal: data.pubkey,
        });
      })
    ),
  });
};
