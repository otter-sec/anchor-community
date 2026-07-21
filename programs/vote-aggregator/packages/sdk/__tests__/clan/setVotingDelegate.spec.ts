import {VoteAggregatorSdk} from '../../src';
import {
  SetVotingDelegateTestData,
  RealmTester,
  setVotingDelegateTestData,
} from 'vote-aggregator-tests';
import {ClanTester, RootTester} from 'vote-aggregator-tests';
import {Keypair} from '@solana/web3.js';

describe('set_voting_delegate instruction', () => {
  it.each(setVotingDelegateTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      clanAuthority,
      newVotingDelegate,
    }: SetVotingDelegateTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const clanTester = new ClanTester({...clan, root: rootTester});
      if (clanAuthority === 'owner') {
        if (!(clanTester.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clanTester.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clanTester.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clanTester.delegate;
      }

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setVotingDelegateInstruction({
          rootAddress: rootTester.rootAddress[0],
          rootData: rootTester.root,
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          newVotingDelegate,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
