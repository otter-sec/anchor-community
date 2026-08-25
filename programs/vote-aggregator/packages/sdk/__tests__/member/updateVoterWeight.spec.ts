import {
  updateVoterWeightTestData,
  MemberTester,
  RealmTester,
  RootTester,
  UpdateVoterWeightTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';

describe('update_voter_weight instruction', () => {
  it.each(updateVoterWeightTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, member}: UpdateVoterWeightTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const memberTester = new MemberTester({
        ...member,
        root: rootTester,
        membership: MemberTester.membershipTesters({
          membership: member.membership || [],
          root: rootTester,
        }),
      });
      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.member.updateVoterWeightInstruction({
          memberData: memberTester.member,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
