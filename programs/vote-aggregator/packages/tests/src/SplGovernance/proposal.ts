import {PublicKey} from '@solana/web3.js';
import {
  InstructionExecutionFlags,
  ProposalAccount,
  ProposalOption,
  ProposalState,
  VoteThreshold,
  VoteType,
} from './accounts';
import {buildSplGovernanceProgram} from './program';
import {GovernanceTester} from './governance';
import BN from 'bn.js';
import {AddedAccount} from 'solana-bankrun';
import {getMinimumBalanceForRentExemption} from '../utils';
import {ClanTester} from '../VoteAggregator';

export type ProposalTestData = {
  address: PublicKey;
  governingTokenMint: PublicKey;
  state: ProposalState;
  owner?: PublicKey;
  signatoriesCount: number;
  signatoriesSignedOffCount: number;
  voteType: VoteType;
  options: ProposalOption[];
  denyVoteWeight?: BN | null;
  abstainVoteWeight?: BN | null;
  startVotingAt?: BN | null;
  draftAt: BN;
  signingOffAt?: BN | null;
  votingAt?: BN | null;
  votingAtSlot?: BN | null;
  votingCompletedAt?: BN | null;
  executingAt?: BN | null;
  closedAt?: BN | null;
  executionFlags?: InstructionExecutionFlags;
  maxVoteWeight?: BN | null;
  maxVotingTime?: number | null;
  voteThreshold: VoteThreshold;
  name: string;
  descriptionLink: string;
  vetoVoteWeight: BN;
};

export class ProposalTester {
  governance: GovernanceTester;
  proposalAddress: PublicKey;
  proposal: ProposalAccount;
  owner: PublicKey;

  constructor({
    address,
    governingTokenMint,
    state,
    governance,
    owner,
    signatoriesCount,
    signatoriesSignedOffCount,
    voteType,
    options,
    denyVoteWeight = null,
    abstainVoteWeight = null,
    startVotingAt = null,
    draftAt,
    signingOffAt = null,
    votingAt = null,
    votingAtSlot = null,
    votingCompletedAt = null,
    executingAt = null,
    closedAt = null,
    executionFlags = {
      none: {},
    },
    maxVoteWeight = null,
    maxVotingTime = null,
    voteThreshold,
    name,
    descriptionLink,
    vetoVoteWeight,
    clan,
  }: ProposalTestData & {
    governance: GovernanceTester;
    clan?: ClanTester;
  }) {
    if (!owner) {
      if (!clan) {
        throw new Error('Either owner or clan must be provided');
      }
      owner = clan.voterAuthority[0];
    }
    this.owner = owner;
    const [tokenOwnerRecord] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance', 'utf-8'),
        governance.realm.realmAddress.toBuffer(),
        governingTokenMint.toBuffer(),
        owner.toBuffer(),
      ],
      governance.realm.splGovernanceId
    );
    this.governance = governance;
    this.proposalAddress = address;

    this.proposal = {
      accountType: {
        proposalV2: {},
      },
      governance: governance.governanceAddress,
      governingTokenMint,
      state,
      tokenOwnerRecord,
      signatoriesCount,
      signatoriesSignedOffCount,
      voteType,
      options,
      denyVoteWeight,
      reserved1: 0,
      abstainVoteWeight,
      startVotingAt,
      draftAt,
      signingOffAt,
      votingAt,
      votingAtSlot,
      votingCompletedAt,
      executingAt,
      closedAt,
      executionFlags,
      maxVoteWeight,
      maxVotingTime,
      voteThreshold,
      reserved: new Array(64).fill(0),
      name,
      descriptionLink,
      vetoVoteWeight,
    };
  }

  async account(): Promise<AddedAccount> {
    const program = buildSplGovernanceProgram({
      splGovernanceId: this.governance.realm.splGovernanceId,
    });
    let proposalData = await program.coder.accounts.encode<ProposalAccount>(
      'proposalV2',
      this.proposal
    );
    proposalData = Buffer.concat([
      proposalData,
      Buffer.alloc(10240 - proposalData.length),
    ]);
    return {
      address: this.proposalAddress,
      info: {
        executable: false,
        owner: program.programId,
        lamports: getMinimumBalanceForRentExemption(proposalData.length),
        data: proposalData,
      },
    };
  }
}
