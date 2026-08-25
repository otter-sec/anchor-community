import {startTest} from '../../dev/startTest';
import {Keypair, PublicKey} from '@solana/web3.js';
import {
  RealmTester,
  buildSplGovernanceProgram,
  CreateRootTestData,
  createRootTestData,
} from 'vote-aggregator-tests';
import {BN} from '@coral-xyz/anchor';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {RootAccount} from 'vote-aggregator-sdk';

describe('create-root command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(createRootTestData.filter(({error}) => !error))(
    'Works for community side',
    async ({realm, maxProposalLifetime}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const {provider} = await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: await realmTester.accounts(),
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: realmTester.splGovernanceId,
        connection: provider.connection,
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'create-root',
              '--realm',
              realmTester.realmAddress.toString(),
              '--side',
              'community',
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
              ...(maxProposalLifetime
                ? ['--max-proposal-lifetime', maxProposalLifetime.toString()]
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

      const [rootAddress, rootBump] = sdk.root.rootAddress({
        realmAddress: realmTester.realmAddress,
        governingTokenMint: realmTester.realm.communityMint,
      });

      const [maxVoterWeightAddress, maxVoterWeightBump] =
        sdk.root.maxVoterWieghtAddress({rootAddress});
      const [lockAuthority, lockAuthorityBump] = sdk.root.lockAuthority({
        rootAddress,
      });

      await expect(
        sdk.root.fetchRoot(rootAddress)
      ).resolves.toStrictEqual<RootAccount>({
        realm: realmTester.realmAddress,
        governanceProgram: realmTester.splGovernanceId,
        governingTokenMint: realmTester.realm.communityMint,
        votingWeightPlugin:
          realmTester.config.communityTokenConfig.voterWeightAddin ||
          PublicKey.default,
        maxProposalLifetime: new BN(maxProposalLifetime || '0'),
        voterWeightReset: null,
        paused: false,
        bumps: {
          root: rootBump,
          maxVoterWeight: maxVoterWeightBump,
          lockAuthority: lockAuthorityBump,
        },
        clanCount: new BN(0),
        memberCount: new BN(0),
      });
      await expect(
        splGovernance.account.realmV2.fetch(realmTester.realmAddress)
      ).resolves.toStrictEqual(realmTester.realm);
      await expect(
        splGovernance.account.realmConfigAccount.fetch(
          await realmTester.realmConfigId()
        )
      ).resolves.toStrictEqual({
        ...realmTester.config,
        communityTokenConfig: {
          ...realmTester.config.communityTokenConfig,
          voterWeightAddin: sdk.programId,
          lockAuthorities: [lockAuthority],
        },
      });

      await expect(
        sdk.root.fetchMaxVoterWeight({maxVoterWeightAddress})
      ).resolves.toStrictEqual({
        realm: realmTester.realmAddress,
        governingTokenMint: realmTester.realm.communityMint,
        maxVoterWeight: new BN(0),
        maxVoterWeightExpiry: null,
        reserved: [0, 0, 0, 0, 0, 0, 0, 0],
      });
    }
  );

  it.each(
    createRootTestData.filter(({realm, error}) => !error && realm.councilMint)
  )(
    'Works for council side',
    async ({realm, maxProposalLifetime}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const {provider} = await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: await realmTester.accounts(),
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: realmTester.splGovernanceId,
        connection: provider.connection,
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'create-root',
              '--realm',
              realmTester.realmAddress.toString(),
              '--side',
              'council',
              '--realm-authority',
              '[' +
                (realmTester.authority as Keypair).secretKey.toString() +
                ']',
              ...(maxProposalLifetime
                ? ['--max-proposal-lifetime', maxProposalLifetime.toString()]
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

      const [rootAddress, rootBump] = sdk.root.rootAddress({
        realmAddress: realmTester.realmAddress,
        governingTokenMint: realmTester.realm.config.councilMint!,
      });

      const [maxVoterWeightAddress, maxVoterWeightBump] =
        sdk.root.maxVoterWieghtAddress({rootAddress});

      const [lockAuthority, lockAuthorityBump] = sdk.root.lockAuthority({
        rootAddress,
      });

      await expect(
        sdk.root.fetchRoot(rootAddress)
      ).resolves.toStrictEqual<RootAccount>({
        realm: realmTester.realmAddress,
        governanceProgram: realmTester.splGovernanceId,
        governingTokenMint: realmTester.realm.config.councilMint!,
        votingWeightPlugin:
          realmTester.config.councilTokenConfig.voterWeightAddin ||
          PublicKey.default,
        maxProposalLifetime: new BN(maxProposalLifetime || '0'),
        voterWeightReset: null,
        paused: false,
        bumps: {
          root: rootBump,
          maxVoterWeight: maxVoterWeightBump,
          lockAuthority: lockAuthorityBump,
        },
        clanCount: new BN(0),
        memberCount: new BN(0),
      });
      await expect(
        splGovernance.account.realmV2.fetch(realmTester.realmAddress)
      ).resolves.toStrictEqual(realmTester.realm);
      await expect(
        splGovernance.account.realmConfigAccount.fetch(
          await realmTester.realmConfigId()
        )
      ).resolves.toStrictEqual({
        ...realmTester.config,
        councilTokenConfig: {
          ...realmTester.config.councilTokenConfig,
          voterWeightAddin: sdk.programId,
          lockAuthorities: [lockAuthority],
        },
      });

      await expect(
        sdk.root.fetchMaxVoterWeight({maxVoterWeightAddress})
      ).resolves.toStrictEqual({
        realm: realmTester.realmAddress,
        governingTokenMint: realmTester.realm.config.councilMint!,
        maxVoterWeight: new BN(0),
        maxVoterWeightExpiry: null,
        reserved: [0, 0, 0, 0, 0, 0, 0, 0],
      });
    }
  );
});
