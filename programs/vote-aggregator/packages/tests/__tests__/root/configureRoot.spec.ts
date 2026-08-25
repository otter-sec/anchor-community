import {startTest} from '../../dev/startTest';
import {Keypair} from '@solana/web3.js';
import {
  ConfigureRootTestData,
  RealmTester,
  parseLogsEvent,
  configureRootTestData,
} from '../../src';
import {RootAccount, RootTester} from '../../src/VoteAggregator';
import BN from 'bn.js';

describe('Configure root', () => {
  it.each(
    configureRootTestData.filter(
      ({error, maxProposalLifetime}) =>
        !error && maxProposalLifetime !== undefined
    )
  )(
    'Runs set_max_proposal_lifetime instruction',
    async ({realm, root, maxProposalLifetime}: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });

      const tx = await program.methods
        .setMaxProposalLifetime(maxProposalLifetime!)
        .accountsStrict({
          root: rootTester.rootAddress[0],
          realm: rootTester.root.realm,
          realmAuthority: realmTester.authorityAddress!,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, realmTester.authority! as Keypair);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'MaxProposalLifetimeChanged',
          data: {
            root: rootTester.rootAddress[0],
            oldMaxProposalLifetime: rootTester.root.maxProposalLifetime,
            newMaxProposalLifetime: maxProposalLifetime,
          },
        },
      ]);

      await expect(
        program.account.root.fetch(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        maxProposalLifetime: maxProposalLifetime!,
      });
    }
  );

  it.each(
    configureRootTestData.filter(
      ({error, voterWeightResetStep}) =>
        !error && voterWeightResetStep !== undefined
    )
  )(
    'Runs set_voter_weight_reset instruction',
    async ({
      realm,
      root,
      voterWeightResetStep,
      nextVoterWeightResetOffset,
    }: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });

      const currentTime = new BN(Math.floor(Date.now() / 1000));
      const newNextResetTime =
        nextVoterWeightResetOffset === null
          ? null
          : currentTime.add(nextVoterWeightResetOffset!);

      const tx = await program.methods
        .setVoterWeightReset(voterWeightResetStep!, newNextResetTime)
        .accountsStrict({
          root: rootTester.rootAddress[0],
          realm: rootTester.root.realm,
          realmAuthority: realmTester.authorityAddress!,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, realmTester.authority! as Keypair);

      const newVoterWeightReset = {
        nextResetTime:
          newNextResetTime || rootTester.root.voterWeightReset!.nextResetTime,
        step: voterWeightResetStep!,
      };
      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'VoterWeightResetChanged',
          data: {
            root: rootTester.rootAddress[0],
            oldVoterWeightReset: rootTester.root.voterWeightReset,
            newVoterWeightReset,
          },
        },
      ]);

      await expect(
        program.account.root.fetch(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        voterWeightReset: newVoterWeightReset,
      });
    }
  );

  it.each(
    configureRootTestData.filter(
      ({error, paused}) => !error && paused !== undefined
    )
  )(
    'Runs pause/resume instruction',
    async ({realm, root, paused}: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });

      const tx = await (paused
        ? program.methods.pause()
        : program.methods.resume()
      )
        .accountsStrict({
          root: rootTester.rootAddress[0],
          realm: rootTester.root.realm,
          realmAuthority: realmTester.authorityAddress!,
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, realmTester.authority! as Keypair);

      const events = [];
      if (!rootTester.root.paused && paused) {
        events.push({
          name: 'Paused',
          data: {
            root: rootTester.rootAddress[0],
          },
        });
      }
      else if (rootTester.root.paused && !paused) {
        events.push({
          name: 'Resumed',
          data: {
            root: rootTester.rootAddress[0],
          },
        });
      }
      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual(events);

      await expect(
        program.account.root.fetch(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        paused: paused!,
      });
    }
  );
});
