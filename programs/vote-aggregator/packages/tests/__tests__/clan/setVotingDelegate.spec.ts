import {startTest} from '../../dev/startTest';
import {
  SetVotingDelegateTestData,
  RealmTester,
  parseLogsEvent,
  setVotingDelegateTestData,
  buildSplGovernanceProgram,
} from '../../src';
import {ClanTester, RootTester} from '../../src/VoteAggregator';
import {Keypair, PublicKey} from '@solana/web3.js';

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
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await clanTester.accounts()),
        ],
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: rootTester.splGovernanceId,
        connection: program.provider.connection,
      });

      const [voterAuthority] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter-authority', 'utf-8'),
          clanTester.clanAddress.toBuffer(),
        ],
        program.programId
      );
      const [clanTor] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('governance', 'utf-8'),
          rootTester.realm.realmAddress.toBuffer(),
          rootTester.governingTokenMint.toBuffer(),
          voterAuthority.toBuffer(),
        ],
        rootTester.splGovernanceId
      );

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

      const tx = await program.methods
        .setVotingDelegate(newVotingDelegate || PublicKey.default)
        .accountsStrict({
          root: rootTester.rootAddress[0],
          clan: clanTester.clanAddress,
          governanceProgram: rootTester.splGovernanceId,
          voterAuthority,
          clanTor,
          clanAuthority: clanAuthority.publicKey,
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
          name: 'ClanVotingDelegateChanged',
          data: {
            clan: clanTester.clanAddress,
            newVotingDelegate: newVotingDelegate || PublicKey.default,
            oldVotingDelegate: clanTester.tokenOwnerRecord.governanceDelegate,
          },
        },
      ]);

      await expect(
        splGovernance.account.tokenOwnerRecordV2.fetch(clanTor)
      ).resolves.toStrictEqual({
        ...clanTester.tokenOwnerRecord,
        governanceDelegate: newVotingDelegate,
      });
    }
  );
});
