import {Keypair, PublicKey} from '@solana/web3.js';
import {getMinimumBalanceForRentExemption} from '../utils';
import {BN} from '@coral-xyz/anchor';
import {MemberAccount} from './accounts';
import {RootTester} from './root';
import {AddedAccount} from 'solana-bankrun';
import {buildVoteAggregatorProgram} from './program';
import {ClanTestData, ClanTester} from './clan';
import {buildSplGovernanceProgram} from '../SplGovernance/program';
import {
  TokenOwnerRecordAccount,
  TokenOwnerRecordLock,
} from '../SplGovernance/accounts';

export type MembershipTester = {
  clan: PublicKey | ClanTester;
  shareBp: number;
  exitableAt?: BN | null;
};

export type MembershipTestData = {
  clan: PublicKey | ClanTestData;
  shareBp: number;
  exitableAt?: BN | null;
};

export type MemberTestData = {
  owner: PublicKey | Keypair;
  delegate?: PublicKey | Keypair;
  voterWeightRecord?: PublicKey;
  voterWeight?: BN;
  voterWeightExpiry?: BN | null;
  nextVoterWeightResetTime?: BN | null;
  membership?: MembershipTestData[];
  governingTokenDepositAmount?: BN;
  unrelinquishedVotesCount?: BN;
  outstandingProposalCount?: number;
  governanceDelegate?: PublicKey | null;
  locks?: TokenOwnerRecordLock[];
};

export class MemberTester {
  public owner: PublicKey | Keypair;
  public delegate?: Keypair;
  public root: RootTester;
  public member: MemberAccount;
  public membership: MembershipTester[];
  public tokenOwnerRecord: TokenOwnerRecordAccount;

  get ownerAddress(): PublicKey {
    return this.owner instanceof Keypair ? this.owner.publicKey : this.owner;
  }

  get memberAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('member', 'utf-8'),
        this.root.rootAddress[0].toBuffer(),
        this.ownerAddress.toBuffer(),
      ],
      this.root.voteAggregatorId
    );
  }

  get tokenOwnerRecordAddress(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance', 'utf-8'),
        this.root.realm.realmAddress.toBuffer(),
        this.root.governingTokenMint.toBuffer(),
        this.ownerAddress.toBuffer(),
      ],
      this.root.splGovernanceId
    );
  }

  static membershipTesters({
    membership,
    root,
  }: {
    membership: MembershipTestData[];
    root: RootTester;
  }) {
    return membership.map(({clan, shareBp, exitableAt}) => ({
      clan: clan instanceof PublicKey ? clan : new ClanTester({...clan, root}),
      shareBp,
      exitableAt,
    }));
  }

  constructor({
    owner,
    delegate,
    root,
    voterWeightRecord = PublicKey.default,
    voterWeight = new BN(0),
    voterWeightExpiry = null,
    nextVoterWeightResetTime = null,
    membership = [],
    governingTokenDepositAmount = new BN(0),
    unrelinquishedVotesCount = new BN(0),
    outstandingProposalCount = 0,
    governanceDelegate = null,
    locks = [],
  }: Omit<MemberTestData, 'membership'> & {
    root: RootTester;
    membership?: MembershipTester[];
  }) {
    this.owner = owner;
    if (delegate instanceof Keypair) {
      this.delegate = delegate;
      delegate = delegate.publicKey;
    }
    this.membership = membership;
    const membershipData = membership.map(({clan, shareBp, exitableAt}) => ({
      clan: clan instanceof ClanTester ? clan.clanAddress : clan,
      shareBp,
      exitableAt: exitableAt || null,
    }));
    this.root = root;

    const [, addressBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('member', 'utf-8'),
        root.rootAddress[0].toBuffer(),
        this.ownerAddress.toBuffer(),
      ],
      root.voteAggregatorId
    );

    const [tokenOwnerRecord, tokenOwnerRecordBump] =
      PublicKey.findProgramAddressSync(
        [
          Buffer.from('governance', 'utf-8'),
          root.realm.realmAddress.toBuffer(),
          root.governingTokenMint.toBuffer(),
          this.ownerAddress.toBuffer(),
        ],
        root.splGovernanceId
      );

    this.member = {
      owner: this.ownerAddress,
      delegate: delegate || PublicKey.default,
      root: root.rootAddress[0],
      voterWeight,
      voterWeightExpiry: voterWeightExpiry,
      tokenOwnerRecord,
      voterWeightRecord,
      nextVoterWeightResetTime,
      membership: membershipData,
      bumps: {
        address: addressBump,
        tokenOwnerRecord: tokenOwnerRecordBump,
      },
    };

    this.tokenOwnerRecord = {
      accountType: {tokenOwnerRecordV2: {}},
      realm: root.realm.realmAddress,
      governingTokenMint: root.governingTokenMint,
      governingTokenOwner: this.ownerAddress,
      governingTokenDepositAmount,
      unrelinquishedVotesCount,
      outstandingProposalCount,
      version: 1,
      reserved: [0, 0, 0, 0, 0, 0],
      governanceDelegate,
      reservedV2: Array(124).fill(0),
      locks,
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
      let memberData = await program.coder.accounts.encode<MemberAccount>(
        'member',
        this.member
      );
      memberData = Buffer.concat([memberData, Buffer.alloc(1024)]);

      accounts.push({
        address: this.memberAddress[0],
        info: {
          executable: false,
          owner: this.root.voteAggregatorId,
          lamports: getMinimumBalanceForRentExemption(memberData.length),
          data: memberData,
        },
      });
    }
    {
      const torData =
        await splGovernance.coder.accounts.encode<TokenOwnerRecordAccount>(
          'tokenOwnerRecordV2',
          this.tokenOwnerRecord
        );
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
