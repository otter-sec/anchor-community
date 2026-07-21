import {
  CreateRootTestData,
  RealmTester,
  createRootTestData,
} from 'vote-aggregator-tests';
import {VoteAggregatorSdk} from '../../src';
import {PublicKey} from '@solana/web3.js';

describe('create_root instruction', () => {
  it.each(createRootTestData.filter(({error}) => !error))(
    'Works for community side',
    async ({realm, maxProposalLifetime}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.root.createRootInstructions({
          splGovernanceId: realmTester.splGovernanceId,
          realmAddress: realmTester.realmAddress,
          realmData: realmTester.splRealmData(),
          realmConfigData: realmTester.splRealmConfigData(),
          side: 'community',
          maxProposalLifetime,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );

  it.each(
    createRootTestData.filter(({realm, error}) => !error && realm.councilMint)
  )(
    'Works for council side',
    async ({realm, maxProposalLifetime}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.root.createRootInstructions({
          splGovernanceId: realmTester.splGovernanceId,
          realmAddress: realmTester.realmAddress,
          realmData: realmTester.splRealmData(),
          realmConfigData: realmTester.splRealmConfigData(),
          side: 'council',
          maxProposalLifetime,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
