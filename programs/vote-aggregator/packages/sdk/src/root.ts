import {
  GetProgramAccountsFilter,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {RealmSide, VoteAggregatorSdk} from './sdk';
import {
  GoverningTokenConfig,
  MintMaxVoteWeightSource,
  createSetRealmConfig,
  getRealm,
  getRealmConfig,
  getRealmConfigAddress,
} from '@solana/spl-governance';
import {AnchorProvider, IdlAccounts, ProgramAccount} from '@coral-xyz/anchor';
import {VoteAggregator} from './vote_aggregator';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import BN from 'bn.js';

export type RootAccount = IdlAccounts<VoteAggregator>['root'];
export type MaxVoterWeightAccount =
  IdlAccounts<VoteAggregator>['maxVoterWeightRecord'];

export class RootSdk {
  constructor(public readonly sdk: VoteAggregatorSdk) {}

  rootAddress({
    realmAddress,
    governingTokenMint,
  }: {
    realmAddress: PublicKey;
    governingTokenMint: PublicKey;
  }): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('root', 'utf-8'),
        realmAddress.toBuffer(),
        governingTokenMint.toBuffer(),
      ],
      this.sdk.programId
    );
  }

  maxVoterWieghtAddress({
    rootAddress,
  }: {
    rootAddress: PublicKey;
  }): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('max-voter-weight', 'utf-8'), rootAddress.toBuffer()],
      this.sdk.programId
    );
  }

  lockAuthority({rootAddress}: {rootAddress: PublicKey}): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('lock-authority', 'utf-8'), rootAddress.toBuffer()],
      this.sdk.programId
    );
  }

  fetchRoot(rootAddress: PublicKey): Promise<RootAccount> {
    return this.sdk.program.account.root.fetch(rootAddress);
  }

  fetchRoots({
    governanceProgram,
    realm,
    governingTokenMint,
    votingWeightPlugin,
  }: {
    governanceProgram?: PublicKey;
    realm?: PublicKey;
    governingTokenMint?: PublicKey;
    votingWeightPlugin?: PublicKey;
  }): Promise<ProgramAccount<RootAccount>[]> {
    let filter: GetProgramAccountsFilter[] | undefined;

    if (governanceProgram) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 8,
          bytes: governanceProgram.toBase58(),
        },
      });
    }

    if (realm) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 40,
          bytes: realm.toBase58(),
        },
      });
    }

    if (governingTokenMint) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 72,
          bytes: governingTokenMint.toBase58(),
        },
      });
    }

    if (votingWeightPlugin) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 104,
          bytes: votingWeightPlugin.toBase58(),
        },
      });
    }

    return this.sdk.program.account.root.all(filter);
  }

  fetchMaxVoterWeight({
    rootAddress,
    maxVoterWeightAddress,
  }: {
    rootAddress?: PublicKey;
    maxVoterWeightAddress?: PublicKey;
  }): Promise<MaxVoterWeightAccount> {
    if (!maxVoterWeightAddress) {
      if (!rootAddress) {
        throw new Error('rootAddress is required');
      }
      maxVoterWeightAddress = this.maxVoterWieghtAddress({rootAddress})[0];
    }
    return this.sdk.program.account.maxVoterWeightRecord.fetch(
      maxVoterWeightAddress
    );
  }

  async createRootInstructions({
    splGovernanceId,
    realmAddress,
    realmData,
    realmConfigData,
    side,
    maxProposalLifetime = new BN(0),
    payer,
  }: {
    splGovernanceId?: PublicKey;
    realmAddress: PublicKey;
    realmData?: {
      communityMint: PublicKey;
      config: {
        councilMint: PublicKey | undefined;
        communityMintMaxVoteWeightSource: MintMaxVoteWeightSource;
        minCommunityTokensToCreateGovernance: BN;
      };
      authority: PublicKey | undefined;
    };
    realmConfigData?: {
      communityTokenConfig: GoverningTokenConfig;
      councilTokenConfig: GoverningTokenConfig;
    };
    side: RealmSide;
    maxProposalLifetime?: BN;
    payer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    if (!realmData) {
      const {account, owner} = await getRealm(
        this.sdk.connection,
        realmAddress
      );
      if (splGovernanceId && !owner.equals(splGovernanceId)) {
        throw new Error(
          `Realm ${realmAddress} is not owned by ${splGovernanceId}`
        );
      }
      realmData = account;
      splGovernanceId = owner;
    }
    if (!splGovernanceId) {
      throw new Error('splGovernanceId is required');
    }
    if (!realmData.authority) {
      throw new Error(`Realm ${realmAddress} does not have an authority`);
    }

    if (!realmConfigData) {
      const {account} = await getRealmConfig(
        this.sdk.connection,
        await getRealmConfigAddress(splGovernanceId, realmAddress)
      );
      realmConfigData = account;
    }

    const governingTokenMint =
      side === 'community'
        ? realmData.communityMint
        : realmData.config.councilMint!;
    if (!governingTokenMint) {
      throw new Error(`Realm ${realmAddress} does not have a ${side} mint`);
    }

    const [rootAddress] = this.rootAddress({realmAddress, governingTokenMint});
    const [maxVwr] = this.maxVoterWieghtAddress({rootAddress});

    const createRootIx = await this.sdk.program.methods
      .createRoot(maxProposalLifetime)
      .accountsStrict({
        root: rootAddress,
        realm: realmAddress,
        realmConfig: await getRealmConfigAddress(splGovernanceId, realmAddress),
        governingTokenMint,
        realmAuthority: realmData.authority,
        maxVwr,
        payer,
        governanceProgram: splGovernanceId,
        systemProgram: SystemProgram.programId,
        voteAggregatorProgram: this.sdk.program.programId,
      })
      .instruction();

    const communityTokenConfigArgs = {
      voterWeightAddin:
        side === 'community'
          ? this.sdk.program.programId
          : realmConfigData.communityTokenConfig.voterWeightAddin,
      maxVoterWeightAddin:
        realmConfigData.communityTokenConfig.maxVoterWeightAddin,
      tokenType: realmConfigData.communityTokenConfig.tokenType,
      useVoterWeightAddin:
        side === 'community' ||
        Boolean(realmConfigData.communityTokenConfig.voterWeightAddin),
      useMaxVoterWeightAddin: Boolean(
        realmConfigData.communityTokenConfig.maxVoterWeightAddin
      ),
    };
    const councilTokenConfigArgs = realmData.config.councilMint
      ? {
          voterWeightAddin:
            side === 'council'
              ? this.sdk.program.programId
              : realmConfigData.councilTokenConfig.voterWeightAddin,
          maxVoterWeightAddin:
            realmConfigData.councilTokenConfig.maxVoterWeightAddin,
          tokenType: realmConfigData.councilTokenConfig.tokenType,
          useVoterWeightAddin:
            side === 'council' ||
            Boolean(realmConfigData.councilTokenConfig.voterWeightAddin),
          useMaxVoterWeightAddin: Boolean(
            realmConfigData.councilTokenConfig.maxVoterWeightAddin
          ),
        }
      : undefined;

    const setRealmConfigIx = await createSetRealmConfig(
      splGovernanceId,
      3,
      realmAddress,
      realmData.authority!,
      realmData.config.councilMint || undefined,
      realmData.config.communityMintMaxVoteWeightSource,
      realmData.config.minCommunityTokensToCreateGovernance,
      communityTokenConfigArgs,
      councilTokenConfigArgs,
      payer
    );

    // TODO: use official JS SDK
    const splGovernance = splGovernanceProgram({
      programId: splGovernanceId,
      provider: new AnchorProvider(
        this.sdk.connection,
        {
          signTransaction: t => Promise.resolve(t),
          signAllTransactions: ts => Promise.resolve(ts),
          publicKey: PublicKey.default,
        },
        {}
      ),
    });
    const [lockAuthority] = this.lockAuthority({rootAddress});
    const setLockAuthorityIx = await splGovernance.methods
      .setRealmConfigItem({
        tokenOwnerRecordLockAuthority: {
          action: {
            add: {},
          },
          governingTokenMint,
          authority: lockAuthority,
        },
      })
      .accountsStrict({
        realm: realmAddress,
        realmAuthority: realmData.authority!,
        payer,
        systemProgram: SystemProgram.programId,
        realmConfigAddress: await getRealmConfigAddress(
          splGovernanceId,
          realmAddress
        ),
      })
      .instruction();

    return [createRootIx, setRealmConfigIx, setLockAuthorityIx];
  }

  async setMaxProposalLifetimeInstruction({
    maxProposalLifetime,
    root,
    realm,
    realmAuthority,
  }: {
    maxProposalLifetime: BN;
    root: PublicKey;
    realm: PublicKey;
    realmAuthority: PublicKey;
  }) {
    return await this.sdk.program.methods
      .setMaxProposalLifetime(maxProposalLifetime)
      .accountsStrict({
        realm,
        realmAuthority,
        root,
      })
      .instruction();
  }

  async setVoterWeightResetInstruction({
    step,
    nextResetTime,
    root,
    realm,
    realmAuthority,
  }: {
    step: BN;
    nextResetTime: BN | null;
    root: PublicKey;
    realm: PublicKey;
    realmAuthority: PublicKey;
  }) {
    return await this.sdk.program.methods
      .setVoterWeightReset(step, nextResetTime)
      .accountsStrict({
        realm,
        realmAuthority,
        root,
      })
      .instruction();
  }

  async pauseInstruction({
    root,
    realm,
    realmAuthority,
  }: {
    root: PublicKey;
    realm: PublicKey;
    realmAuthority: PublicKey;
  }) {
    return await this.sdk.program.methods
      .pause()
      .accountsStrict({
        root,
        realm,
        realmAuthority,
      })
      .instruction();
  }

  async resumeInstruction({
    root,
    realm,
    realmAuthority,
  }: {
    root: PublicKey;
    realm: PublicKey;
    realmAuthority: PublicKey;
  }) {
    return await this.sdk.program.methods
      .resume()
      .accountsStrict({
        root,
        realm,
        realmAuthority,
      })
      .instruction();
  }

  async setVotingWeightPluginInstruction({
    votingWeightPlugin,
    root,
    realm,
    realmAuthority,
  }: {
    votingWeightPlugin: PublicKey;
    root: PublicKey;
    realm: PublicKey;
    realmAuthority: PublicKey;
  }) {
    return await this.sdk.program.methods
      .setVoterWeightPlugin(votingWeightPlugin)
      .accountsStrict({
        configureRoot: {
          root,
          realm,
          realmAuthority,
        },
        maxVwr: this.maxVoterWieghtAddress({rootAddress: root})[0],
      })
      .instruction();
  }
}
