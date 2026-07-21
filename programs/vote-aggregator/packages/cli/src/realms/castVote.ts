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
  SYSTEM_PROGRAM_ID,
  Vote,
  VoteKind,
  createInstructionData,
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
} from '@solana/spl-governance';
import {VoterStakeRegistry, IDL as VsrIdl} from './voter_stake_registry';
import {IdlAccounts} from '@coral-xyz/anchor';

export type RegistrarAccount = IdlAccounts<VoterStakeRegistry>['registrar'];
export type VoterAccount = IdlAccounts<VoterStakeRegistry>['voter'];

export const installCastVoteCLI = (program: Command) => {
  program
    .command('cast-vote')
    .requiredOption('--proposal <pubkey>', 'Proposal')
    .option('--side <community|council>', 'Side', 'council')
    .option('--no', 'No', false)
    .action(castVote);
};

const castVote = async ({
  proposal,
  side,
  no,
}: {
  proposal: string;
  side: RealmSide;
  no: boolean;
}) => {
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

  const governingTokenMint =
    side === 'community'
      ? realmData.communityMint
      : realmData.config.councilMint!;

  const tor = await getTokenOwnerRecordAddress(
    proposalInfo.owner,
    governanceData.realm,
    governingTokenMint,
    provider.publicKey!
  );

  const voteAddress = await getVoteRecordAddress(
    proposalInfo.owner,
    proposalAddress,
    tor
  );

  const {blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });

  await withCastVote(
    tx.instructions,
    proposalInfo.owner,
    PROGRAM_VERSION_V3,
    governanceData.realm,
    proposalData.governance,
    proposalAddress,
    proposalData.tokenOwnerRecord,
    tor,
    provider.publicKey!,
    governingTokenMint,
    new Vote({
      voteType: no ? VoteKind.Deny : VoteKind.Approve,
      approveChoices: no
        ? undefined
        : [
            {
              rank: 0,
              weightPercentage: 100,
            },
          ],
      deny: no ? true : undefined,
      veto: undefined,
    }),
    provider.publicKey!
  );

  const r = await provider.sendAndConfirm!(tx);
  console.log(`Casting vote ${r}`);
};
