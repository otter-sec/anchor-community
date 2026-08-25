import {
  CreateMemberTestData,
  RealmTester,
  RootTester,
  createMemberTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {PublicKey} from '@solana/web3.js';

describe('create_member instruction', () => {
  it.each(createMemberTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, member}: CreateMemberTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.member.createMemberInstruction({
          rootAddress: rootTester.rootAddress[0],
          rootData: rootTester.root,
          owner: member.owner.publicKey,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
