import {
  ClanTester,
  JoinClanTestData,
  MemberTester,
  RealmTester,
  RootTester,
  joinClanTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {PublicKey} from '@solana/web3.js';

describe('join_clan instruction', () => {
  it.each(joinClanTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      memberVoterWeight,
      clan,
    }: JoinClanTestData) => {
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
      const clanTester = new ClanTester({...clan, root: rootTester});
      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.member.joinClanInstruction({
          rootData: rootTester.root,
          memberData: memberTester.member,
          clanAddress: clanTester.clanAddress,
          memberVwr: memberVoterWeight.address,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
