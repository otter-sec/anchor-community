import {
  CreateClanTestData,
  RealmTester,
  RootTester,
  createClanTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {PublicKey} from '@solana/web3.js';

describe('create_clan instruction', () => {
  it.each(createClanTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, clan}: CreateClanTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.createClanInstruction({
          rootAddress: rootTester.rootAddress[0],
          rootData: rootTester.root,
          clanAddress: clan.address.publicKey,
          owner: clan.owner,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
