import {startTest} from '../../dev/startTest';
import {
  SetClanOwnerTestData,
  parseLogsEvent,
  setClanOwnerTestData,
} from '../../src';
import {ClanTester} from '../../src/VoteAggregator';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('set_clan_owner instruction', () => {
  it.each(setClanOwnerTestData.filter(({error}) => !error))(
    'Works',
    async ({clan, clanAuthority, newOwner}: SetClanOwnerTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      const {testContext, program} = await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      }

      const tx = await program.methods
        .setClanOwner(newOwner)
        .accountsStrict({
          clan: clan.address,
          owner: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'ClanOwnerChanged',
          data: {
            clan: clan.address,
            oldOwner:
              clan.owner instanceof Keypair ? clan.owner.publicKey : clan.owner,
            newOwner,
          },
        },
      ]);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        owner: newOwner,
      });
    }
  );
});
