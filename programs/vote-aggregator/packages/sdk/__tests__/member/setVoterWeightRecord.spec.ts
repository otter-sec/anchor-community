import {
  SetVoterWeightRecordTestData,
  MemberTester,
  RealmTester,
  RootTester,
  setVoterWeightRecordTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';

describe('set_voter_weight_record instruction', () => {
  it.each(setVoterWeightRecordTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      memberVoterWeightRecord,
    }: SetVoterWeightRecordTestData) => {
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
        sdk.member.setVoterWeightRecordInstruction({
          memberData: memberTester.member,
          memberVwr: memberVoterWeightRecord.address,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
