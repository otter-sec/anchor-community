import {startTest} from '../../dev/startTest';
import {
  ResizeClanTestData,
  parseLogsEvent,
  resizeClanTestData,
} from '../../src';
import {ClanTester} from '../../src/VoteAggregator';
import {Keypair, PublicKey} from '@solana/web3.js';
import {SYSTEM_PROGRAM_ID} from '@solana/spl-governance';

describe('resize_clan instruction', () => {
  it.each(resizeClanTestData.filter(({error}) => !error))(
    'Works',
    async ({clan, clanAuthority, newSize}: ResizeClanTestData) => {
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
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }

      const tx = await program.methods
        .resizeClan(newSize)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
          payer: program.provider.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
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
          name: 'ClanResized',
          data: {
            clan: clan.address,
            newSize,
          },
        },
      ]);

      await expect(
        program.provider.connection
          .getAccountInfo(clan.address)
          .then(a => a?.data.length)
      ).resolves.toStrictEqual(newSize);
    }
  );
});
