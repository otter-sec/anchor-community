import {PublicKey} from '@solana/web3.js';
import {VoteAccount, Vote} from './accounts';
import {buildSplGovernanceProgram} from './program';
import BN from 'bn.js';
import {AddedAccount} from 'solana-bankrun';
import {getMinimumBalanceForRentExemption} from '../utils';
import {ProposalTester} from './proposal';
import {
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
} from '@solana/spl-governance';
import {ClanTester} from '../VoteAggregator';

export type VoteTestData = {
  owner?: PublicKey;
  governingTokenMint?: PublicKey;
  isRelinquished: boolean;
  voterWeight: BN;
  vote: Vote;
};

export class VoteTester {
  proposal: ProposalTester;
  governingTokenMint: PublicKey;
  vote: VoteAccount;

  async voteAddress(): Promise<PublicKey> {
    return await getVoteRecordAddress(
      this.proposal.governance.realm.splGovernanceId,
      this.proposal.proposalAddress,
      await getTokenOwnerRecordAddress(
        this.proposal.governance.realm.splGovernanceId,
        this.proposal.governance.realm.realmAddress,
        this.governingTokenMint,
        this.vote.governingTokenOwner
      )
    );
  }

  constructor({
    proposal,
    owner,
    isRelinquished,
    voterWeight,
    vote,
    clan,
    governingTokenMint,
  }: VoteTestData & {proposal: ProposalTester; clan?: ClanTester}) {
    if (!owner) {
      if (!clan) {
        throw new Error('Either owner or clan must be provided');
      }
      owner = clan.voterAuthority[0];
    }
    if (!governingTokenMint) {
      if (!clan) {
        throw new Error('Either governingTokenMint or clan must be provided');
      }
      governingTokenMint = clan.root.governingTokenMint;
    }
    this.governingTokenMint = governingTokenMint;
    this.proposal = proposal;
    this.vote = {
      accountType: {voteRecordV2: {}},
      proposal: proposal.proposalAddress,
      governingTokenOwner: owner,
      isRelinquished,
      voterWeight,
      vote,
      reservedV2: [],
    };
  }

  async account(): Promise<AddedAccount> {
    const program = buildSplGovernanceProgram({
      splGovernanceId: this.proposal.governance.realm.splGovernanceId,
    });
    let voteData = await program.coder.accounts.encode<VoteAccount>(
      'voteRecordV2',
      this.vote
    );
    voteData = Buffer.concat([voteData, Buffer.alloc(1024 - voteData.length)]);
    return {
      address: await this.voteAddress(),
      info: {
        executable: false,
        owner: program.programId,
        lamports: getMinimumBalanceForRentExemption(voteData.length),
        data: voteData,
      },
    };
  }
}
