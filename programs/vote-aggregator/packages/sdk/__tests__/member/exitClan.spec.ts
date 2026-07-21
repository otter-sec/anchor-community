import {
  ExitClanTestData,
  MemberTester,
  RealmTester,
  RootTester,
  exitClanTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {BN} from '@coral-xyz/anchor';
import {PublicKey} from '@solana/web3.js';

describe('exit_clan instruction', () => {
  it.each(exitClanTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      clanIndex = 0,
      clanLeavingTimeOffset,
    }: ExitClanTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const currentTime = new BN(Math.floor(Date.now() / 1000));
      const membership = MemberTester.membershipTesters({
        membership: member.membership || [],
        root: rootTester,
      });
      membership[clanIndex].exitableAt ||= currentTime.add(
        clanLeavingTimeOffset!
      );
      const memberTester = new MemberTester({
        ...member,
        root: rootTester,
        membership,
      });
      const sdk = new VoteAggregatorSdk();
      const clan = memberTester.membership[clanIndex].clan;
      expect(
        sdk.member.exitClanInstruction({
          rootData: rootTester.root,
          memberData: memberTester.member,
          clan: clan instanceof PublicKey ? clan : clan.clanAddress,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
