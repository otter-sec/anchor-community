import {IdlAccounts, IdlTypes} from '@coral-xyz/anchor';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';

// for types only
const splGovernanceIdl = () => splGovernanceProgram().idl;
export type SplGovernanceIdl = ReturnType<typeof splGovernanceIdl>;

export type RealmAccount = IdlAccounts<SplGovernanceIdl>['realmV2'];
export type RealmConfigAccount =
  IdlAccounts<SplGovernanceIdl>['realmConfigAccount'];
export type RealmConfig = IdlTypes<SplGovernanceIdl>['RealmConfig'];
export type GoverningTokenConfig =
  IdlTypes<SplGovernanceIdl>['GoverningTokenConfig'];
export type GoverningTokenType =
  IdlTypes<SplGovernanceIdl>['GoverningTokenType'];
export type TokenOwnerRecordAccount =
  IdlAccounts<SplGovernanceIdl>['tokenOwnerRecordV2'];
export type GovernanceAccount = IdlAccounts<SplGovernanceIdl>['governanceV2'];
export type GovernanceConfig = IdlTypes<SplGovernanceIdl>['GovernanceConfig'];
export type ProposalAccount = IdlAccounts<SplGovernanceIdl>['proposalV2'];
export type ProposalState = IdlTypes<SplGovernanceIdl>['ProposalState'];
export type VoteType = IdlTypes<SplGovernanceIdl>['VoteType'];
export type ProposalOption = IdlTypes<SplGovernanceIdl>['ProposalOption'];
export type InstructionExecutionFlags =
  IdlTypes<SplGovernanceIdl>['InstructionExecutionFlags'];
export type VoteThreshold = IdlTypes<SplGovernanceIdl>['VoteThreshold'];
export type VoteAccount = IdlAccounts<SplGovernanceIdl>['voteRecordV2'];
export type Vote = IdlTypes<SplGovernanceIdl>['Vote'];
export type TokenOwnerRecordLock =
  IdlTypes<SplGovernanceIdl>['TokenOwnerRecordLock'];
