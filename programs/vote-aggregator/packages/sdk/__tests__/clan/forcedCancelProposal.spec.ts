import {VoteAggregatorSdk} from '../../src';
import {
  ForcedCancelProposalTestData,
  RealmTester,
  forcedCancelProposalTestData,
} from 'vote-aggregator-tests';
import {
  ClanTester,
  RootTester,
  GovernanceTester,
  ProposalTester,
} from 'vote-aggregator-tests';

describe('forced_cancel_proposal instruction', () => {
  it.each(forcedCancelProposalTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      governance,
      proposal,
    }: ForcedCancelProposalTestData) => {
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
        sdk.clan.forcedCancelProposalInstruction({
          rootAddress: rootTester.rootAddress[0],
          rootData: rootTester.root,
          clanAddress: clan.address,
          governance: governanceTester.governanceAddress,
          proposal: proposalTester.proposalAddress,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
