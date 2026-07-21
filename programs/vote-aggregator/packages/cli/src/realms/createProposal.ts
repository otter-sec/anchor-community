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
  createInstructionData,
  getInstructionDataFromBase64,
  getNativeTreasuryAddress,
  getProposalDepositAddress,
  getProposalTransactionAddress,
  getRealm,
  getRealmConfigAddress,
  getTokenHoldingAddress,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance';
import {VoterStakeRegistry, IDL as VsrIdl} from './voter_stake_registry';
import {IdlAccounts} from '@coral-xyz/anchor';

export type RegistrarAccount = IdlAccounts<VoterStakeRegistry>['registrar'];
export type VoterAccount = IdlAccounts<VoterStakeRegistry>['voter'];

export const installCreateProposalCLI = (program: Command) => {
  program
    .command('create-proposal')
    .requiredOption('--governance <pubkey>', 'Governance')
    .option('--side <community|council>', 'Side', 'council')
    .option(
      '--name <string>',
      'Proposal name',
      'Proposal ' + Math.random().toString()
    )
    .option('--description <string>', 'Description', '')
    .option('--instruction [instructions...]', 'Insturctions', [])
    .action(createProposal);
};

const createProposal = async ({
  governance,
  side,
  name,
  description,
  instruction,
}: {
  governance: string;
  side: RealmSide;
  name: string;
  description: string;
  instruction: string[];
}) => {
  const {sdk, provider} = context!;
  const governanceAddress = await parsePubkey(governance);
  const governanceInfo =
    await provider.connection.getAccountInfo(governanceAddress);
  if (!governanceInfo) {
    throw new Error(`Governance ${governance} does not exists`);
  }
  const splGov = splGovernanceProgram({
    programId: governanceInfo.owner,
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

  const governanceData =
    await splGov.account.governanceV2.fetch(governanceAddress);
  const realmData = await splGov.account.realmV2.fetch(governanceData.realm);

  const governingTokenMint =
    side === 'community'
      ? realmData.communityMint
      : realmData.config.councilMint!;

  const seed = Keypair.generate().publicKey;
  const [proposalAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('governance', 'utf-8'),
      governanceAddress.toBuffer(),
      governingTokenMint.toBuffer(),
      seed.toBuffer(),
    ],
    governanceInfo.owner
  );

  const proposalOwnerRecord = await getTokenOwnerRecordAddress(
    governanceInfo.owner,
    governanceData.realm,
    governingTokenMint,
    provider.publicKey!
  );

  let {blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash();
  let tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });

  tx.add(
    await splGov.methods
      .createProposal(
        name,
        description,
        {singleChoice: {}},
        ['Ok'],
        true,
        seed
      )
      .accountsStrict({
        governingTokenMint,
        realm: governanceData.realm,
        proposalAddress,
        governance: governanceAddress,
        proposalOwnerRecord,
        governanceAuthority: provider.publicKey!,
        payer: provider.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .remainingAccounts([
        {
          pubkey: await getRealmConfigAddress(
            governanceInfo.owner,
            governanceData.realm
          ),
          isWritable: false,
          isSigner: false,
        },
        // TODO vwr
        {
          pubkey: await getProposalDepositAddress(
            governanceInfo.owner,
            proposalAddress,
            provider.publicKey!
          ),
          isWritable: true,
          isSigner: false,
        },
      ])
      .instruction()
  );

  let r = await provider.sendAndConfirm!(tx);
  console.log(`Creating proposal ${name}: ${r}`);

  for (let i = 0; i < instruction.length; i++) {
    ({blockhash, lastValidBlockHeight} =
      await sdk.connection.getLatestBlockhash());
    tx = new Transaction({
      feePayer: provider.publicKey!,
      blockhash,
      lastValidBlockHeight,
    });

    const proposalTransactionAddress = await getProposalTransactionAddress(
      governanceInfo.owner,
      PROGRAM_VERSION_V3,
      proposalAddress,
      0,
      i
    );
    const ix = getInstructionDataFromBase64(instruction[i]);
    tx.add(
      await splGov.methods
        .insertTransaction(0, i, 0, [
          {
            ...ix,
            data: Buffer.from(ix.data),
          },
        ])
        .accountsStrict({
          proposal: proposalAddress,
          governance: governanceAddress,
          governanceAuthority: provider.publicKey!,
          payer: provider.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          tokenOwnerRecord: proposalOwnerRecord,
          proposalTransactionAddress,
        })
        .instruction()
    );

    r = await provider.sendAndConfirm!(tx);
    console.log(`Adding ix #${i}: ${r}`);
  }
  ({blockhash, lastValidBlockHeight} =
    await sdk.connection.getLatestBlockhash());
  tx = new Transaction({
    feePayer: provider.publicKey!,
    blockhash,
    lastValidBlockHeight,
  });
  tx.add(
    await splGov.methods
      .signOffProposal()
      .accountsStrict({
        proposal: proposalAddress,
        realm: governanceData.realm,
        governance: governanceAddress,
        signatory: provider.publicKey!,
      })
      .remainingAccounts([
        {
          pubkey: proposalOwnerRecord,
          isWritable: true,
          isSigner: false,
        },
      ])
      .instruction()
  );

  r = await provider.sendAndConfirm!(tx);
  console.log(`Finilizing: ${r}`);
};
