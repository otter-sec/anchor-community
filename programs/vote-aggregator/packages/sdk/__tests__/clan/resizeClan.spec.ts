import {ResizeClanTestData, resizeClanTestData} from 'vote-aggregator-tests';
import {Keypair, PublicKey} from '@solana/web3.js';
import {VoteAggregatorSdk} from '../../src';

describe('resize_clan instruction', () => {
  it.each(resizeClanTestData.filter(({error}) => !error))(
    'Works',
    async ({clan, clanAuthority, newSize}: ResizeClanTestData) => {
      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.resizeClanInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          size: newSize,
          payer: PublicKey.default,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
