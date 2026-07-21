import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {BN} from 'bn.js';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import {AnchorProvider, Program} from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  GOVERNANCE_PROGRAM_SEED,
  PROGRAM_VERSION_V3,
  ProposalTransaction,
  SYSTEM_PROGRAM_ID,
  Vote,
  VoteKind,
  createInstructionData,
  getGovernanceAccount,
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  getProposalDepositAddress,
  getProposalTransactionAddress,
  getRealm,
  getRealmConfigAddress,
  getTokenHoldingAddress,
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
  withCastVote,
  withExecuteTransaction,
} from '@solana/spl-governance';
import {VoterStakeRegistry, IDL as VsrIdl} from './voter_stake_registry';
import {IdlAccounts} from '@coral-xyz/anchor';

export type RegistrarAccount = IdlAccounts<VoterStakeRegistry>['registrar'];
export type VoterAccount = IdlAccounts<VoterStakeRegistry>['voter'];

export const installExecuteProposalCLI = (program: Command) => {
  program
    .command('execute-proposal')
    .requiredOption('--proposal <pubkey>', 'Proposal')
    .action(executeProposal);
};

const executeProposal = async ({proposal}: {proposal: string}) => {
  const {sdk, provider} = context!;
  const proposalAddress = await parsePubkey(proposal);
  const proposalInfo =
    await provider.connection.getAccountInfo(proposalAddress);
  if (!proposalInfo) {
    throw new Error(`Proposal ${proposal} does not exists`);
  }
  const splGov = splGovernanceProgram({
    programId: proposalInfo.owner,
    provider: new AnchorProvider(
      sdk.connection,
      {
        signTransaction: t => Promise.resolve(t),
        signAllTransactions: ts => Promise.resolve(ts),
        publicKey: PublicKey.default,
      },
      {}
    ),
  });

  const proposalData = await splGov.account.proposalV2.fetch(proposalAddress);
  const governanceData = await splGov.account.governanceV2.fetch(
    proposalData.governance
  );
  const realmData = await splGov.account.realmV2.fetch(governanceData.realm);

  for (
    let index = 0;
    index < proposalData.options[0].transactionsCount;
    index++
  ) {
    const txAddress = await getProposalTransactionAddress(
      proposalInfo.owner,
      PROGRAM_VERSION_V3,
      proposalAddress,
      0,
      index
    );
    const txData = await getGovernanceAccount(
      provider.connection,
      txAddress,
      ProposalTransaction
    );
    const {blockhash, lastValidBlockHeight} =
      await sdk.connection.getLatestBlockhash();
    const tx = new Transaction({
      feePayer: provider.publicKey!,
      blockhash,
      lastValidBlockHeight,
    });

    await withExecuteTransaction(
      tx.instructions,
      proposalInfo.owner,
      PROGRAM_VERSION_V3,
      proposalData.governance,
      proposalAddress,
      txAddress,
      [txData.account.instructions[0]]
    );

    const r = await provider.sendAndConfirm!(tx);
    console.log(`Executing #${index}: ${r}`);
  }
};
