import {startTest} from '../../dev/startTest';
import {Keypair, SystemProgram} from '@solana/web3.js';
import {PublicKey} from '@solana/web3.js';
import {buildSplGovernanceProgram} from '../../src/SplGovernance/program';
import {
  CreateRootTestData,
  RealmTester,
  parseLogsEvent,
  createRootTestData,
  RootAccount,
} from '../../src';
import {BN} from '@coral-xyz/anchor';
import {
  GoverningTokenType,
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
  createSetRealmConfig,
} from '@solana/spl-governance';

describe('create_root instruction', () => {
  it.each(createRootTestData.filter(({error}) => !error))(
    'Works for community side',
    async ({realm, maxProposalLifetime = new BN(0)}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const {program, testContext} = await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: await realmTester.accounts(),
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: realmTester.splGovernanceId,
        connection: program.provider.connection,
      });
      const [rootAddress, rootBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('root', 'utf-8'),
          realmTester.realmAddress.toBuffer(),
          realmTester.realm.communityMint.toBuffer(),
        ],
        program.programId
      );
      const [maxVwr, maxVwrBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('max-voter-weight', 'utf-8'), rootAddress.toBuffer()],
        program.programId
      );

      const communityTokenConfigArgs = {
        voterWeightAddin: new PublicKey(
          'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
        ),
        maxVoterWeightAddin:
          realmTester.config.communityTokenConfig.maxVoterWeightAddin ||
          undefined,
        tokenType: realmTester.config.communityTokenConfig.tokenType.liquid
          ? GoverningTokenType.Liquid
          : realmTester.config.communityTokenConfig.tokenType.membership
          ? GoverningTokenType.Membership
          : GoverningTokenType.Dormant,
        useVoterWeightAddin: Boolean(
          realmTester.config.communityTokenConfig.voterWeightAddin
        ),
        useMaxVoterWeightAddin: Boolean(
          realmTester.config.communityTokenConfig.maxVoterWeightAddin
        ),
      };
      const councilTokenConfigArgs = realmTester.realm.config.councilMint
        ? {
            voterWeightAddin:
              realmTester.config.councilTokenConfig.voterWeightAddin ||
              undefined,
            maxVoterWeightAddin:
              realmTester.config.councilTokenConfig.maxVoterWeightAddin ||
              undefined,
            tokenType: realmTester.config.councilTokenConfig.tokenType.liquid
              ? GoverningTokenType.Liquid
              : realmTester.config.councilTokenConfig.tokenType.membership
              ? GoverningTokenType.Membership
              : GoverningTokenType.Dormant,
            useVoterWeightAddin: true,
            useMaxVoterWeightAddin: Boolean(
              realmTester.config.councilTokenConfig.maxVoterWeightAddin
            ),
          }
        : undefined;

      const [lockAuthority, lockAuthorityBump] =
        PublicKey.findProgramAddressSync(
          [Buffer.from('lock-authority', 'utf8'), rootAddress.toBuffer()],
          program.programId
        );

      const tx = await program.methods
        .createRoot(maxProposalLifetime)
        .accountsStrict({
          root: rootAddress,
          realm: realmTester.realmAddress,
          realmConfig: await realmTester.realmConfigId(),
          governingTokenMint: realmTester.realm.communityMint,
          realmAuthority: realmTester.realm.authority!,
          maxVwr: maxVwr,
          payer: program.provider.publicKey!,
          governanceProgram: realmTester.splGovernanceId,
          systemProgram: SystemProgram.programId,
          voteAggregatorProgram: program.programId,
        })
        .postInstructions([
          await createSetRealmConfig(
            realmTester.splGovernanceId,
            3,
            realmTester.realmAddress,
            realmTester.realm.authority!,
            realmTester.realm.config.councilMint || undefined,
            new MintMaxVoteWeightSource({
              type: realmTester.realm.config.communityMintMaxVoterWeightSource
                .absolute
                ? MintMaxVoteWeightSourceType.Absolute
                : MintMaxVoteWeightSourceType.SupplyFraction,
              value: (realmTester.realm.config.communityMintMaxVoterWeightSource
                .absolute ||
                realmTester.realm.config.communityMintMaxVoterWeightSource
                  .supplyFraction) as unknown as BN,
            }),
            realmTester.realm.config.minCommunityWeightToCreateGovernance,
            communityTokenConfigArgs,
            councilTokenConfigArgs,
            program.provider.publicKey!
          ),
          await splGovernance.methods
            .setRealmConfigItem({
              tokenOwnerRecordLockAuthority: {
                action: {
                  add: {},
                },
                governingTokenMint: realmTester.realm.communityMint,
                authority: lockAuthority,
              },
            })
            .accountsStrict({
              realm: realmTester.realmAddress,
              realmAuthority: realmTester.realm.authority!,
              payer: program.provider.publicKey!,
              systemProgram: SystemProgram.programId,
              realmConfigAddress: await realmTester.realmConfigId(),
            })
            .instruction(),
        ])
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, realmTester.authority as Keypair);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'RootCreated',
          data: {
            root: rootAddress,
            governanceProgram: realmTester.splGovernanceId,
            realm: realmTester.realmAddress,
            governingTokenMint: realmTester.realm.communityMint,
            votingWeightPlugin:
              realmTester.config.communityTokenConfig.voterWeightAddin,
          },
        },
      ]);

      await expect(
        program.account.root.fetch(rootAddress)
      ).resolves.toStrictEqual<RootAccount>({
        realm: realmTester.realmAddress,
        governanceProgram: realmTester.splGovernanceId,
        governingTokenMint: realmTester.realm.communityMint,
        votingWeightPlugin:
          realmTester.config.communityTokenConfig.voterWeightAddin ||
          PublicKey.default,
        maxProposalLifetime,
        voterWeightReset: null,
        paused: false,
        bumps: {
          root: rootBump,
          maxVoterWeight: maxVwrBump,
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
          voterWeightAddin: program.programId,
          lockAuthorities: [lockAuthority],
        },
      });

      await expect(
        program.account.maxVoterWeightRecord.fetch(maxVwr)
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
    async ({realm, maxProposalLifetime = new BN(0)}: CreateRootTestData) => {
      const realmTester = new RealmTester(realm);
      const {program, testContext} = await startTest({
        splGovernanceId: realmTester.splGovernanceId,
        accounts: await realmTester.accounts(),
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: realmTester.splGovernanceId,
        connection: program.provider.connection,
      });
      const [rootAddress, rootBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('root', 'utf-8'),
          realmTester.realmAddress.toBuffer(),
          realmTester.realm.config.councilMint!.toBuffer(),
        ],
        program.programId
      );
      const [maxVwr, maxVwrBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('max-voter-weight', 'utf-8'), rootAddress.toBuffer()],
        program.programId
      );

      const communityTokenConfigArgs = {
        voterWeightAddin:
          realmTester.config.communityTokenConfig.voterWeightAddin || undefined,
        maxVoterWeightAddin:
          realmTester.config.communityTokenConfig.maxVoterWeightAddin ||
          undefined,
        tokenType: realmTester.config.communityTokenConfig.tokenType.liquid
          ? GoverningTokenType.Liquid
          : realmTester.config.communityTokenConfig.tokenType.membership
          ? GoverningTokenType.Membership
          : GoverningTokenType.Dormant,
        useVoterWeightAddin: Boolean(
          realmTester.config.communityTokenConfig.voterWeightAddin
        ),
        useMaxVoterWeightAddin: Boolean(
          realmTester.config.communityTokenConfig.maxVoterWeightAddin
        ),
      };
      const councilTokenConfigArgs = {
        voterWeightAddin: new PublicKey(
          'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
        ),
        maxVoterWeightAddin:
          realmTester.config.councilTokenConfig.maxVoterWeightAddin ||
          undefined,
        tokenType: realmTester.config.councilTokenConfig.tokenType.liquid
          ? GoverningTokenType.Liquid
          : realmTester.config.councilTokenConfig.tokenType.membership
          ? GoverningTokenType.Membership
          : GoverningTokenType.Dormant,
        useVoterWeightAddin: true,
        useMaxVoterWeightAddin: Boolean(
          realmTester.config.councilTokenConfig.maxVoterWeightAddin
        ),
      };

      const [lockAuthority, lockAuthorityBump] =
        PublicKey.findProgramAddressSync(
          [Buffer.from('lock-authority', 'utf8'), rootAddress.toBuffer()],
          program.programId
        );

      const tx = await program.methods
        .createRoot(maxProposalLifetime)
        .accountsStrict({
          root: rootAddress,
          realm: realmTester.realmAddress,
          realmConfig: await realmTester.realmConfigId(),
          governingTokenMint: realmTester.realm.config.councilMint!,
          realmAuthority: realmTester.realm.authority!,
          maxVwr: maxVwr,
          payer: program.provider.publicKey!,
          governanceProgram: realmTester.splGovernanceId,
          systemProgram: SystemProgram.programId,
          voteAggregatorProgram: program.programId,
        })
        .postInstructions([
          await createSetRealmConfig(
            realmTester.splGovernanceId,
            3,
            realmTester.realmAddress,
            realmTester.realm.authority!,
            realmTester.realm.config.councilMint!,
            new MintMaxVoteWeightSource({
              type: realmTester.realm.config.communityMintMaxVoterWeightSource
                .absolute
                ? MintMaxVoteWeightSourceType.Absolute
                : MintMaxVoteWeightSourceType.SupplyFraction,
              value: (realmTester.realm.config.communityMintMaxVoterWeightSource
                .absolute ||
                realmTester.realm.config.communityMintMaxVoterWeightSource
                  .supplyFraction) as unknown as BN,
            }),
            realmTester.realm.config.minCommunityWeightToCreateGovernance,
            communityTokenConfigArgs,
            councilTokenConfigArgs,
            program.provider.publicKey!
          ),
          await splGovernance.methods
            .setRealmConfigItem({
              tokenOwnerRecordLockAuthority: {
                action: {
                  add: {},
                },
                governingTokenMint: realmTester.realm.config.councilMint!,
                authority: lockAuthority,
              },
            })
            .accountsStrict({
              realm: realmTester.realmAddress,
              realmAuthority: realmTester.realm.authority!,
              payer: program.provider.publicKey!,
              systemProgram: SystemProgram.programId,
              realmConfigAddress: await realmTester.realmConfigId(),
            })
            .instruction(),
        ])
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, realmTester.authority as Keypair);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'RootCreated',
          data: {
            root: rootAddress,
            governanceProgram: realmTester.splGovernanceId,
            realm: realmTester.realmAddress,
            governingTokenMint: realmTester.realm.config.councilMint!,
            votingWeightPlugin:
              realmTester.config.councilTokenConfig.voterWeightAddin,
          },
        },
      ]);

      await expect(
        program.account.root.fetch(rootAddress)
      ).resolves.toStrictEqual<RootAccount>({
        realm: realmTester.realmAddress,
        governanceProgram: realmTester.splGovernanceId,
        governingTokenMint: realmTester.realm.config.councilMint!,
        votingWeightPlugin:
          realmTester.config.councilTokenConfig.voterWeightAddin ||
          PublicKey.default,
        maxProposalLifetime,
        voterWeightReset: null,
        paused: false,
        bumps: {
          root: rootBump,
          maxVoterWeight: maxVwrBump,
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
          voterWeightAddin: program.programId,
          lockAuthorities: [lockAuthority],
        },
      });

      await expect(
        program.account.maxVoterWeightRecord.fetch(maxVwr)
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
