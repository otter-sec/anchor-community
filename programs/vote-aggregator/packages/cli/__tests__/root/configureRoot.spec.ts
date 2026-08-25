import {startTest} from '../../dev/startTest';
import {Keypair} from '@solana/web3.js';
import {
  RealmTester,
  ConfigureRootTestData,
  configureRootTestData,
  RootTester,
} from 'vote-aggregator-tests';
import {BN} from '@coral-xyz/anchor';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import { RootAccount } from 'vote-aggregator-sdk';

describe('Configure root', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(
    configureRootTestData.filter(
      ({error, maxProposalLifetime}) =>
        !error && maxProposalLifetime !== undefined
    )
  )(
    'Runs set_max_proposal_lifetime instruction',
    async ({root, realm, maxProposalLifetime}: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'set-max-proposal-lifetime',
              '--root',
              rootTester.rootAddress[0].toString(),
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
              '--max-proposal-lifetime',
              maxProposalLifetime!.toString(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      await expect(
        sdk.root.fetchRoot(rootTester.rootAddress[0])
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
    'Sets voter weight reset step',
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
      await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });

      const {sdk} = context!;
      const currentTime = new BN(Math.floor(Date.now() / 1000));
      const newNextResetTime =
        nextVoterWeightResetOffset === null
          ? null
          : currentTime.add(nextVoterWeightResetOffset!);

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'set-voter-weight-reset',
              '--root',
              rootTester.rootAddress[0].toString(),
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
              '--step',
              voterWeightResetStep!.toString(),
              ...(newNextResetTime !== null
                ? ['--next-reset-time', newNextResetTime.toString()]
                : []),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      const newVoterWeightReset = {
        nextResetTime:
          newNextResetTime || rootTester.root.voterWeightReset!.nextResetTime,
        step: voterWeightResetStep!,
      };

      await expect(
        sdk.root.fetchRoot(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        voterWeightReset: newVoterWeightReset,
      });
    }
  );

  it.each(
    configureRootTestData.filter(
      ({error, paused}) =>
        !error && paused !== undefined
    )
  )(
    'Pauses/resumes',
    async ({root, realm, paused}: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              paused ? 'pause' : 'resume',
              '--root',
              rootTester.rootAddress[0].toString(),
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      await expect(
        sdk.root.fetchRoot(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        paused: paused!,
      });
    }
  );

  it.each(
    configureRootTestData.filter(
      ({error, votingWeightPlugin}) =>
        !error && votingWeightPlugin !== undefined
    )
  )(
    'Sets voting weight plugin',
    async ({root, realm, votingWeightPlugin}: ConfigureRootTestData) => {
      const realmTester = new RealmTester(realm);
      if (!(realmTester.authority instanceof Keypair)) {
        throw new Error('Realm authority keypair is required');
      }
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
        ],
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'set-voting-weight-plugin',
              '--root',
              rootTester.rootAddress[0].toString(),
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
              '--voting-weight-plugin',
              votingWeightPlugin!.toString(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      await expect(
        sdk.root.fetchRoot(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        votingWeightPlugin: votingWeightPlugin!,
      });
    }
  );
});
