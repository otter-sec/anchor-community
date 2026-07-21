import {startTest} from '../../dev/startTest';
import {
  ConfigureClanTestData,
  parseLogsEvent,
  configureClanTestData,
} from '../../src';
import {ClanTester} from '../../src/VoteAggregator';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('Configure clan instructions', () => {
  it.each(
    configureClanTestData.filter(
      ({error, newDelegate}) => !error && newDelegate !== undefined
    )
  )(
    'Sets the delegate',
    async ({clan, clanAuthority, newDelegate}: ConfigureClanTestData) => {
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
        .setClanDelegate(newDelegate!)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      const events = [];
      if (!clanAccount.delegate.equals(newDelegate!)) {
        events.push({
          name: 'ClanDelegateChanged',
          data: {
            clan: clan.address,
            oldDelegate: clanAccount.delegate,
            newDelegate,
          },
        });
      }
      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        delegate: newDelegate!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newName}) => !error && newName !== undefined
    )
  )(
    'Sets the name',
    async ({clan, clanAuthority, newName}: ConfigureClanTestData) => {
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
        .setClanName(newName!)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      const events = [];
      if (clanAccount.name !== newName) {
        events.push({
          name: 'ClanNameChanged',
          data: {
            clan: clan.address,
            oldName: clan.name,
            newName,
          },
        });
      }

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        name: newName!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newDescription: description}) =>
        !error && description !== undefined
    )
  )(
    'Sets the description',
    async ({clan, clanAuthority, newDescription}: ConfigureClanTestData) => {
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
        .setClanDescription(newDescription!)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      const events = [];
      if (clanAccount.description !== newDescription) {
        events.push({
          name: 'ClanDescriptionChanged',
          data: {
            clan: clan.address,
            oldDescription: clan.description,
            newDescription,
          },
        });
      }

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        description: newDescription!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newMinVotingWeightToJoin}) =>
        !error && newMinVotingWeightToJoin !== undefined
    )
  )(
    'Sets minVotingWeightToJoin',
    async ({
      clan,
      clanAuthority,
      newMinVotingWeightToJoin,
    }: ConfigureClanTestData) => {
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
        .setClanMinVotingWeightToJoin(newMinVotingWeightToJoin!)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      const events = [];
      if (clanAccount.minVotingWeightToJoin !== newMinVotingWeightToJoin) {
        events.push({
          name: 'ClanMinVotingWeightToJoinChanged',
          data: {
            clan: clan.address,
            oldMinVotingWeightToJoin: clanAccount.minVotingWeightToJoin,
            newMinVotingWeightToJoin,
          },
        });
      }

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        minVotingWeightToJoin: newMinVotingWeightToJoin!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newAcceptTemporaryMembers}) =>
        !error && newAcceptTemporaryMembers !== undefined
    )
  )(
    'Sets AcceptTemporaryMembers',
    async ({
      clan,
      clanAuthority,
      newAcceptTemporaryMembers,
    }: ConfigureClanTestData) => {
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
        .setClanAcceptTemporaryMembers(newAcceptTemporaryMembers!)
        .accountsStrict({
          clan: clan.address,
          clanAuthority: clanAuthority.publicKey,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, clanAuthority);

      const events = [];
      if (clanAccount.acceptTemporaryMembers !== newAcceptTemporaryMembers) {
        events.push({
          name: 'ClanAcceptTemporaryMembersChanged',
          data: {
            clan: clan.address,
            oldAcceptTemporaryMembers: clanAccount.acceptTemporaryMembers,
            newAcceptTemporaryMembers,
          },
        });
      }

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.clan.fetch(clan.address)
      ).resolves.toStrictEqual({
        ...clanAccount,
        acceptTemporaryMembers: newAcceptTemporaryMembers!,
      });
    }
  );
});
