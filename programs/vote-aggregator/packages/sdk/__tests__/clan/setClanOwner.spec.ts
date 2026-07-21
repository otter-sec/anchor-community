import {
  SetClanOwnerTestData,
  setClanOwnerTestData,
} from 'vote-aggregator-tests';
import {Keypair} from '@solana/web3.js';
import {VoteAggregatorSdk} from '../../src';

describe('set_clan_owner instruction', () => {
  it.each(setClanOwnerTestData.filter(({error}) => !error))(
    'Works',
    async ({clan, clanAuthority, newOwner}: SetClanOwnerTestData) => {
      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      }

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanOwnerInstruction({
          clanAddress: clan.address,
          owner: clanAuthority.publicKey,
          newOwner,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
