import {VoteAggregatorSdk} from '../../src';
import {
  UpdateProposalVoteTestData,
  RealmTester,
  updateProposalVoteTestData,
} from 'vote-aggregator-tests';
import {
  ClanTester,
  RootTester,
  GovernanceTester,
  ProposalTester,
} from 'vote-aggregator-tests';
import {PublicKey} from '@solana/web3.js';

describe('update_proposal_vote instruction', () => {
  it.each(updateProposalVoteTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      governance,
      proposal,
    }: UpdateProposalVoteTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const clanTester = new ClanTester({...clan, root: rootTester});
      const governanceTester = new GovernanceTester({
        ...governance,
        realm: realmTester,
      });
      const proposalTester = new ProposalTester({
        ...proposal,
        governance: governanceTester,
        clan: proposal.owner ? undefined : clanTester,
      });

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.udpateProposalVote({
          rootAddress: rootTester.rootAddress[0],
          rootData: rootTester.root,
          clanAddress: clan.address,
          governance: governanceTester.governanceAddress,
          proposal: proposalTester.proposalAddress,
          proposalOwnerRecord: proposalTester.proposal.tokenOwnerRecord,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
