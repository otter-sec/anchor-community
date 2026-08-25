import {BN} from '@coral-xyz/anchor';
import {
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
  getRealmConfigAddress,
  getTokenHoldingAddress,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance';
import {Keypair, PublicKey} from '@solana/web3.js';
import {AddedAccount} from 'solana-bankrun';
import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {MintAccount, buildSplTokenProgram} from '../splToken';
import {
  GoverningTokenType,
  RealmAccount,
  RealmConfigAccount,
  TokenOwnerRecordAccount,
} from './accounts';
import {buildSplGovernanceProgram} from './program';
import {getMinimumBalanceForRentExemption} from '../utils';
import {
  Realm as SplRealm,
  RealmConfig as SplRealmConfig,
  RealmConfigAccount as SplRealmConfigAccount,
  GoverningTokenType as SplGoverningTokenType,
} from '@solana/spl-governance';
import {
  VoterWeightRecordAccount,
  buildVoteAggregatorProgram,
} from '../VoteAggregator';

const splToken = buildSplTokenProgram();

export type GoverningTokenConfigArgs = {
  voterWeightAddin?: PublicKey | null;
  maxVoterWeightAddin?: PublicKey | null;
  tokenType?: GoverningTokenType;
  lockAuthorities?: PublicKey[];
};

export type VoterWeightRecordTestData = {
  address: PublicKey;
  voterWeight: BN;
  voterWeightExpiry?: BN | null;
  plugin: PublicKey;
};

export type RealmTestData = {
  splGovernanceId: PublicKey;
  realmAddress: PublicKey;
  communityMint: PublicKey;
  councilMint?: PublicKey | null;
  communityMintMaxVoterWeightSource: {supplyFraction: BN} | {absolute: BN};
  minCommunityWeightToCreateGovernance: BN;
  authority?: Keypair | PublicKey | undefined;
  name: string;
  communityTokenConfig?: GoverningTokenConfigArgs;
  councilTokenConfig?: GoverningTokenConfigArgs;
  communityMintAuthority?: PublicKey | Keypair;
  councilMintAuthority?: PublicKey | Keypair;
};

export class RealmTester {
  public splGovernanceId: PublicKey;
  public realmAddress: PublicKey;
  public realm: RealmAccount;
  public config: RealmConfigAccount;
  public authority?: Keypair | PublicKey;
  public communityMintAuthority?: PublicKey | Keypair;
  public councilMintAuthority?: PublicKey | Keypair;

  get authorityAddress(): PublicKey | undefined {
    return this.authority instanceof Keypair
      ? this.authority.publicKey
      : this.authority;
  }

  constructor({
    splGovernanceId,
    realmAddress,
    communityMint,
    councilMint = null,
    communityMintMaxVoterWeightSource,
    minCommunityWeightToCreateGovernance,
    authority,
    name,
    communityTokenConfig = {},
    councilTokenConfig = {},
    communityMintAuthority,
    councilMintAuthority,
  }: RealmTestData) {
    this.splGovernanceId = splGovernanceId;
    this.realmAddress = realmAddress;

    this.authority = authority;
    this.communityMintAuthority = communityMintAuthority;
    this.councilMintAuthority = councilMintAuthority;

    this.realm = {
      accountType: {realmV2: {}},
      communityMint,
      reserved: [0, 0, 0, 0, 0, 0],
      reservedV2: new Array<number>(128).fill(0),
      legacy1: 0,
      config: {
        councilMint,
        communityMintMaxVoterWeightSource:
          communityMintMaxVoterWeightSource as unknown as
            | {supplyFraction: [BN]}
            | {absolute: [BN]}, // anchor type bug
        minCommunityWeightToCreateGovernance,
        reserved: [0, 0, 0, 0, 0, 0],
        legacy1: 0,
        legacy2: 0,
      },
      authority: this.authorityAddress || null,
      name,
    };
    this.config = {
      accountType: {realmConfig: {}},
      realm: this.realmAddress,
      communityTokenConfig: {
        voterWeightAddin: communityTokenConfig.voterWeightAddin || null,
        maxVoterWeightAddin: communityTokenConfig.maxVoterWeightAddin || null,
        tokenType: communityTokenConfig.tokenType || {liquid: {}},
        reserved: new Array(4).fill(0),
        lockAuthorities: communityTokenConfig.lockAuthorities || [],
      },
      councilTokenConfig: {
        voterWeightAddin: councilTokenConfig.voterWeightAddin || null,
        maxVoterWeightAddin: councilTokenConfig.maxVoterWeightAddin || null,
        tokenType: councilTokenConfig.tokenType || {liquid: {}},
        reserved: new Array(4).fill(0),
        lockAuthorities: councilTokenConfig.lockAuthorities || [],
      },
      reserved: 0, // Dummy value for undefined schema type
    };
  }

  realmConfigId(): Promise<PublicKey> {
    return getRealmConfigAddress(this.splGovernanceId, this.realmAddress);
  }

  councilTokenHoldings(): Promise<PublicKey | null> {
    if (!this.realm.config.councilMint) return Promise.resolve(null);
    return getTokenHoldingAddress(
      this.splGovernanceId,
      this.realmAddress,
      this.realm.config.councilMint!
    );
  }

  communityTokenHoldings(): Promise<PublicKey> {
    return getTokenHoldingAddress(
      this.splGovernanceId,
      this.realmAddress,
      this.realm.communityMint
    );
  }

  async accounts(): Promise<AddedAccount[]> {
    const program = buildSplGovernanceProgram({
      splGovernanceId: this.splGovernanceId,
    });
    const realmData = await program.coder.accounts.encode<RealmAccount>(
      'realmV2',
      this.realm
    );
    let configData = await program.coder.accounts.encode<RealmConfigAccount>(
      'realmConfigAccount',
      this.config
    );
    configData = Buffer.concat([
      configData,
      Buffer.alloc(293 - configData.length),
    ]);
    const accounts = [
      {
        address: this.realmAddress,
        info: {
          executable: false,
          owner: program.programId,
          lamports: getMinimumBalanceForRentExemption(realmData.length),
          data: realmData,
        },
      },
      {
        address: await this.realmConfigId(),
        info: {
          executable: false,
          owner: program.programId,
          lamports: getMinimumBalanceForRentExemption(configData.length),
          data: configData,
        },
      },
    ];
    if (this.communityMintAuthority) {
      const mintAuthority =
        this.communityMintAuthority instanceof Keypair
          ? this.communityMintAuthority.publicKey
          : this.communityMintAuthority;
      const mintData = await splToken.coder.accounts.encode<MintAccount>(
        'mint',
        {
          mintAuthority,
          supply: new BN(0),
          decimals: 0,
          isInitialized: true,
          freezeAuthority: null,
        }
      );
      accounts.push({
        address: this.realm.communityMint,
        info: {
          executable: false,
          owner: TOKEN_PROGRAM_ID,
          lamports: getMinimumBalanceForRentExemption(mintData.length),
          data: mintData,
        },
      });
    }
    if (this.councilMintAuthority) {
      if (!this.realm.config.councilMint) {
        throw new Error('Council mint authority without council mint');
      }
      const mintAuthority =
        this.councilMintAuthority instanceof Keypair
          ? this.councilMintAuthority.publicKey
          : this.councilMintAuthority;
      const mintData = await splToken.coder.accounts.encode<MintAccount>(
        'mint',
        {
          mintAuthority,
          supply: new BN(0),
          decimals: 0,
          isInitialized: true,
          freezeAuthority: null,
        }
      );
      accounts.push({
        address: this.realm.config.councilMint,
        info: {
          executable: false,
          owner: TOKEN_PROGRAM_ID,
          lamports: getMinimumBalanceForRentExemption(mintData.length),
          data: mintData,
        },
      });
    }
    return accounts;
  }

  splRealmData(): SplRealm {
    return new SplRealm({
      communityMint: this.realm.communityMint,
      reserved: new Uint8Array(6),
      config: new SplRealmConfig({
        councilMint: this.realm.config.councilMint || undefined,
        communityMintMaxVoteWeightSource: new MintMaxVoteWeightSource({
          type: this.realm.config.communityMintMaxVoterWeightSource.absolute
            ? MintMaxVoteWeightSourceType.Absolute
            : MintMaxVoteWeightSourceType.SupplyFraction,
          value: (this.realm.config.communityMintMaxVoterWeightSource
            .absolute ||
            this.realm.config.communityMintMaxVoterWeightSource
              .supplyFraction) as unknown as BN, // anchor type bug
        }),
        minCommunityTokensToCreateGovernance:
          this.realm.config.minCommunityWeightToCreateGovernance,
        reserved: new Uint8Array(6),
        useCommunityVoterWeightAddin: false,
        useMaxCommunityVoterWeightAddin: false,
      }),
      votingProposalCount: 0,
      authority: this.realm.authority || undefined,
      name: this.realm.name,
    });
  }

  splRealmConfigData(): SplRealmConfigAccount {
    return new SplRealmConfigAccount({
      realm: this.realmAddress,
      communityTokenConfig: {
        voterWeightAddin:
          this.config.communityTokenConfig.voterWeightAddin || undefined,
        maxVoterWeightAddin:
          this.config.communityTokenConfig.maxVoterWeightAddin || undefined,
        tokenType: this.config.communityTokenConfig.tokenType.liquid
          ? SplGoverningTokenType.Liquid
          : this.config.communityTokenConfig.tokenType.dormant
          ? SplGoverningTokenType.Dormant
          : SplGoverningTokenType.Membership,
        reserved: new Uint8Array(8),
      },
      councilTokenConfig: {
        voterWeightAddin:
          this.config.councilTokenConfig.voterWeightAddin || undefined,
        maxVoterWeightAddin:
          this.config.councilTokenConfig.maxVoterWeightAddin || undefined,
        tokenType: this.config.councilTokenConfig.tokenType.liquid
          ? SplGoverningTokenType.Liquid
          : this.config.councilTokenConfig.tokenType.dormant
          ? SplGoverningTokenType.Dormant
          : SplGoverningTokenType.Membership,
        reserved: new Uint8Array(8),
      },
      reserved: new Uint8Array(200),
    });
  }

  async tokenOwnerRecord({
    owner,
    side,
    governingTokenMint,
  }: {
    owner: PublicKey;
    side?: 'council' | 'community';
    governingTokenMint?: PublicKey;
  }): Promise<AddedAccount> {
    if (!governingTokenMint) {
      if (!side) {
        throw new Error('Either side or governingTokenMint must be provided');
      }
      governingTokenMint =
        side === 'community'
          ? this.realm.communityMint
          : this.realm.config.councilMint!;
    }

    const record: TokenOwnerRecordAccount = {
      accountType: {tokenOwnerRecordV2: {}},
      version: 1,
      realm: this.realmAddress,
      governingTokenMint,
      governingTokenOwner: owner,
      governingTokenDepositAmount: new BN(0),
      unrelinquishedVotesCount: new BN(0),
      outstandingProposalCount: 0,
      reserved: [0, 0, 0, 0, 0, 0],
      governanceDelegate: null,
      reservedV2: Array(124).fill(0),
      locks: [],
    };
    const program = buildSplGovernanceProgram({
      splGovernanceId: this.splGovernanceId,
    });
    const data = await program.coder.accounts.encode<TokenOwnerRecordAccount>(
      'tokenOwnerRecordV2',
      record
    );

    return {
      address: await getTokenOwnerRecordAddress(
        this.splGovernanceId,
        this.realmAddress,
        governingTokenMint,
        owner
      ),
      info: {
        executable: false,
        owner: program.programId,
        lamports: getMinimumBalanceForRentExemption(data.length),
        data,
      },
    };
  }

  async voterWeightRecord({
    address,
    plugin,
    owner,
    side,
    voterWeight,
    voterWeightExpiry = null,
  }: VoterWeightRecordTestData & {
    owner: PublicKey;
    side: 'council' | 'community';
  }): Promise<AddedAccount> {
    const governingTokenMint =
      side === 'community'
        ? this.realm.communityMint
        : this.realm.config.councilMint!;

    const record: VoterWeightRecordAccount = {
      realm: this.realmAddress,
      governingTokenMint,
      governingTokenOwner: owner,
      voterWeight,
      voterWeightExpiry,
      weightAction: null,
      weightActionTarget: null,
      reserved: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    const program = buildVoteAggregatorProgram({});
    const data = await program.coder.accounts.encode<VoterWeightRecordAccount>(
      'voterWeightRecord',
      record
    );

    return {
      address,
      info: {
        executable: false,
        owner: plugin,
        lamports: getMinimumBalanceForRentExemption(data.length),
        data,
      },
    };
  }
}
