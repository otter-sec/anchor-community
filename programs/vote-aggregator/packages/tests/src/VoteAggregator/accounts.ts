import {IdlAccounts, IdlTypes} from '@coral-xyz/anchor';

import {VoteAggregator} from './vote_aggregator';

export type VoterWeightReset = IdlTypes<VoteAggregator>['VoterWeightReset'];
export type RootAccount = IdlAccounts<VoteAggregator>['root'];
export type ClanAccount = IdlAccounts<VoteAggregator>['clan'];
export type MemberAccount = IdlAccounts<VoteAggregator>['member'];
export type MembershipEntry = IdlTypes<VoteAggregator>['MembershipEntry'];
export type VoterWeightRecordAccount =
  IdlAccounts<VoteAggregator>['voterWeightRecord'];
export type MaxVoterWeightRecordAccount =
  IdlAccounts<VoteAggregator>['maxVoterWeightRecord'];
