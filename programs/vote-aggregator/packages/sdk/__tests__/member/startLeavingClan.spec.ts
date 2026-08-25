import {
  StartLeavingClanTestData,
  MemberTester,
  RealmTester,
  RootTester,
  startLeavingClanTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {PublicKey} from '@solana/web3.js';

describe('start_leaving_clan instruction', () => {
  it.each(startLeavingClanTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, member, clanIndex = 0}: StartLeavingClanTestData) => {
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
      const clan = memberTester.membership[clanIndex].clan;
      expect(
        sdk.member.startLeavingClanInstruction({
          memberData: memberTester.member,
          clan: clan instanceof PublicKey ? clan : clan.clanAddress,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
