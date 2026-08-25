import {Keypair, PublicKey} from '@solana/web3.js';
import {getMinimumBalanceForRentExemption} from '../utils';
import {BN} from '@coral-xyz/anchor';
import {ClanAccount, VoterWeightRecordAccount} from './accounts';
import {RootTester} from './root';
import {AddedAccount} from 'solana-bankrun';
import {buildVoteAggregatorProgram} from './program';
import {buildSplGovernanceProgram} from '../SplGovernance/program';
import {TokenOwnerRecordAccount} from '../SplGovernance/accounts';

export type ClanTestData = {
  address: PublicKey;
  size?: number;
  owner: PublicKey | Keypair;
  delegate?: PublicKey | Keypair;
  minVotingWeightToJoin?: BN;
  permanentMembers?: BN;
  temporaryMembers?: BN;
  updatedTemporaryMembers?: BN;
  leavingMembers?: BN;
  name: string;
  description?: string;
  voterWeight?: BN;
  acceptTemporaryMembers?: boolean;
  permanentVoterWeight?: BN;
  nextVoterWeightResetTime?: BN | null;
  governingTokenDepositAmount?: BN;
  unrelinquishedVotesCount?: BN;
  outstandingProposalCount?: number;
  governanceDelegate?: PublicKey | null;
};

export class ClanTester {
  public owner?: Keypair;
  public delegate?: Keypair;
  public root: RootTester;
  public clanAddress: PublicKey;
  public clan: ClanAccount;
  public clanSize?: number;
  public tokenOwnerRecord: TokenOwnerRecordAccount;
  public voterWeightRecord: VoterWeightRecordAccount;

  get voterAuthority(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('voter-authority', 'utf-8'), this.clanAddress.toBuffer()],
      this.root.voteAggregatorId
    );
  }

  get voterWeightAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('voter-weight', 'utf-8'), this.clanAddress.toBuffer()],
      this.root.voteAggregatorId
    );
  }

  get tokenOwnerRecordAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance', 'utf-8'),
        this.root.realm.realmAddress.toBuffer(),
        this.root.governingTokenMint.toBuffer(),
        this.voterAuthority[0].toBuffer(),
      ],
      this.root.splGovernanceId
    );
  }

  static async encodeClanAccount({
    clan,
    address,
    size,
    voteAggregatorId,
  }: {
    clan: ClanAccount;
    address: PublicKey;
    size?: number;
    voteAggregatorId: PublicKey;
  }) {
    const program = buildVoteAggregatorProgram({
      voteAggregatorId,
    });

    let clanData = await program.coder.accounts.encode<ClanAccount>(
      'clan',
      clan
    );
    if (size !== undefined) {
      if (size < clanData.length) {
        throw new Error(
          `Clan size ${size} is too small for ${clanData.length} bytes of data`
        );
      }
      clanData = Buffer.concat([
        clanData,
        Buffer.alloc(size - clanData.length),
      ]);
    }
    return {
      address,
      info: {
        executable: false,
        owner: voteAggregatorId,
        lamports: getMinimumBalanceForRentExemption(clanData.length),
        data: clanData,
      },
    };
  }

  static clanAccount({
    owner,
    delegate,
    root,
    minVotingWeightToJoin = new BN(0),
    permanentMembers = new BN(0),
    temporaryMembers = new BN(0),
    updatedTemporaryMembers = new BN(0),
    leavingMembers = new BN(0),
    acceptTemporaryMembers = true,
    permanentVoterWeight = new BN(0),
    nextVoterWeightResetTime = null,
    name,
    description = '',
  }: ClanTestData & {root: PublicKey}): ClanAccount {
    return {
      root,
      owner: owner instanceof Keypair ? owner.publicKey : owner,
      delegate:
        delegate instanceof Keypair
          ? delegate.publicKey
          : delegate || PublicKey.default,
      voterAuthority: PublicKey.default,
      tokenOwnerRecord: PublicKey.default,
      voterWeightRecord: PublicKey.default,
      minVotingWeightToJoin: minVotingWeightToJoin,
      acceptTemporaryMembers,
      permanentVoterWeight,
      nextVoterWeightResetTime,
      bumps: {
        voterAuthority: 0,
        tokenOwnerRecord: 0,
        voterWeightRecord: 0,
      },
      permanentMembers,
      temporaryMembers,
      updatedTemporaryMembers,
      leavingMembers,
      name,
      description,
    };
  }

  constructor({
    address,
    size,
    owner,
    delegate,
    root,
    minVotingWeightToJoin = new BN(0),
    permanentMembers = new BN(0),
    temporaryMembers = new BN(0),
    updatedTemporaryMembers = new BN(0),
    leavingMembers = new BN(0),
    name,
    description = '',
    voterWeight = new BN(0),
    acceptTemporaryMembers = true,
    permanentVoterWeight = new BN(0),
    nextVoterWeightResetTime = null,
    governingTokenDepositAmount = new BN(0),
    unrelinquishedVotesCount = new BN(0),
    outstandingProposalCount = 0,
    governanceDelegate = null,
  }: ClanTestData & {root: RootTester}) {
    this.clanAddress = address;
    this.clanSize = size;
    if (owner instanceof Keypair) {
      this.owner = owner;
      owner = owner.publicKey;
    }
    if (delegate instanceof Keypair) {
      this.delegate = delegate;
      delegate = delegate.publicKey;
    }
    this.root = root;

    const [voterAuthority, voterAuthorityBump] =
      PublicKey.findProgramAddressSync(
        [Buffer.from('voter-authority', 'utf-8'), address.toBuffer()],
        root.voteAggregatorId
      );

    const [tokenOwnerRecord, tokenOwnerRecordBump] =
      PublicKey.findProgramAddressSync(
        [
          Buffer.from('governance', 'utf-8'),
          root.realm.realmAddress.toBuffer(),
          root.governingTokenMint.toBuffer(),
          voterAuthority.toBuffer(),
        ],
        root.splGovernanceId
      );

    const [voterWeightRecord, voterWeightRecordBump] =
      PublicKey.findProgramAddressSync(
        [Buffer.from('voter-weight', 'utf-8'), address.toBuffer()],
        root.voteAggregatorId
      );

    this.clan = {
      root: root.rootAddress[0],
      owner,
      delegate: delegate || PublicKey.default,
      voterAuthority,
      tokenOwnerRecord,
      voterWeightRecord,
      minVotingWeightToJoin,
      acceptTemporaryMembers,
      permanentVoterWeight,
      nextVoterWeightResetTime,
      bumps: {
        voterAuthority: voterAuthorityBump,
        tokenOwnerRecord: tokenOwnerRecordBump,
        voterWeightRecord: voterWeightRecordBump,
      },
      permanentMembers,
      temporaryMembers,
      updatedTemporaryMembers,
      leavingMembers,
      name,
      description,
    };

    this.voterWeightRecord = {
      realm: root.realm.realmAddress,
      governingTokenMint: root.governingTokenMint,
      governingTokenOwner: this.voterAuthority[0],
      voterWeight,
      voterWeightExpiry: null,
      weightAction: null,
      weightActionTarget: null,
      reserved: [0, 0, 0, 0, 0, 0, 0, 0],
    };

    this.tokenOwnerRecord = {
      accountType: {tokenOwnerRecordV2: {}},
      realm: root.realm.realmAddress,
      governingTokenMint: root.governingTokenMint,
      governingTokenOwner: voterAuthority,
      governingTokenDepositAmount,
      unrelinquishedVotesCount,
      outstandingProposalCount,
      version: 1,
      reserved: [0, 0, 0, 0, 0, 0],
      governanceDelegate,
      reservedV2: Array(124).fill(0),
      locks: [],
    };
  }

  async accounts(): Promise<AddedAccount[]> {
    const accounts: AddedAccount[] = [];

    const program = buildVoteAggregatorProgram({
      voteAggregatorId: this.root.voteAggregatorId,
    });
    const splGovernance = buildSplGovernanceProgram({
      splGovernanceId: this.root.splGovernanceId,
    });
    {
      accounts.push(
        await ClanTester.encodeClanAccount({
          clan: this.clan,
          address: this.clanAddress,
          size: this.clanSize,
          voteAggregatorId: this.root.voteAggregatorId,
        })
      );
    }

    {
      const voterWeigthRecordData =
        await program.coder.accounts.encode<VoterWeightRecordAccount>(
          'voterWeightRecord',
          this.voterWeightRecord
        );
      accounts.push({
        address: this.voterWeightAddress[0],
        info: {
          executable: false,
          owner: this.root.voteAggregatorId,
          lamports: getMinimumBalanceForRentExemption(
            voterWeigthRecordData.length
          ),
          data: voterWeigthRecordData,
        },
      });
    }

    {
      let torData =
        await splGovernance.coder.accounts.encode<TokenOwnerRecordAccount>(
          'tokenOwnerRecordV2',
          this.tokenOwnerRecord
        );
      // append 64 zeroes to the torData: Buffer
      torData = Buffer.concat([torData, Buffer.alloc(64)]);
      accounts.push({
        address: this.tokenOwnerRecordAddress[0],
        info: {
          executable: false,
          owner: this.root.splGovernanceId,
          lamports: getMinimumBalanceForRentExemption(torData.length),
          data: torData,
        },
      });
    }

    return accounts;
  }
}
