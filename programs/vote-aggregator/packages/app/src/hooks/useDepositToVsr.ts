import {useMutation, useQueryClient} from '@tanstack/react-query';
import vsrSdk, {RegistrarAccount} from '../fetchers/vsrSdk';
import {
  Cluster,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import BN from 'bn.js';
import {VsrVoterInfo} from '../fetchers/fetchVsrVoter';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {vsrVoterQueryOptions} from '../queryOptions';
import {
  PROGRAM_VERSION_V3,
  SYSTEM_PROGRAM_ID,
  getTokenOwnerRecordAddress,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import { AnchorProvider } from '@coral-xyz/anchor';

const useDepositToVsr = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      network,
      rootData,
      vsrVoterData,
      configIndex,
      depositIndex,
      balance,
    }: {
      network: Cluster;
      rootAddress: PublicKey;
      rootData: {
        governanceProgram: PublicKey;
        realm: PublicKey;
        governingTokenMint: PublicKey;
        votingWeightPlugin: PublicKey;
        registrar: RegistrarAccount;
      };
      vsrVoterData: VsrVoterInfo;
      configIndex: number;
      depositIndex?: number;
      balance: BN;
    }) => {
      const splGovernance = splGovernanceProgram({
        programId: rootData.governanceProgram,
        provider: new AnchorProvider(
          connection,
          {
            signTransaction: async t => t,
            signAllTransactions: async t => t,
            publicKey: publicKey!,
          },
          {}
        ),
      });
      const vsr = vsrSdk({network, vsrProgram: rootData.votingWeightPlugin});
      const [registrarAddress] = PublicKey.findProgramAddressSync(
        [
          rootData.realm.toBuffer(),
          Buffer.from('registrar', 'utf-8'),
          rootData.governingTokenMint.toBuffer(),
        ],
        rootData.votingWeightPlugin
      );
      const [voterAddress, voterBump] = PublicKey.findProgramAddressSync(
        [
          registrarAddress.toBuffer(),
          Buffer.from('voter', 'utf-8'),
          publicKey!.toBuffer(),
        ],
        rootData.votingWeightPlugin
      );
      const vault = getAssociatedTokenAddressSync(
        rootData.registrar.votingMints[configIndex].mint,
        voterAddress,
        true
      );

      const tor = await getTokenOwnerRecordAddress(
        rootData.governanceProgram,
        rootData.realm,
        rootData.governingTokenMint,
        publicKey!
      );

      const torInfo = await connection.getAccountInfo(tor);

      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: publicKey!,
        blockhash,
        lastValidBlockHeight,
      });

      if (!torInfo) {
        withCreateTokenOwnerRecord(
          tx.instructions,
          splGovernance.programId,
          PROGRAM_VERSION_V3,
          rootData.realm,
          publicKey!,
          rootData.governingTokenMint,
          publicKey!
        );
      }

      if (!vsrVoterData.voter) {
        const [voterWeightRecord, voterWeightRecordBump] =
          PublicKey.findProgramAddressSync(
            [
              registrarAddress.toBuffer(),
              Buffer.from('voter-weight-record', 'utf-8'),
              publicKey!.toBuffer(),
            ],
            rootData.votingWeightPlugin
          );
        tx.add(
          await vsr.methods
            .createVoter(voterBump, voterWeightRecordBump)
            .accountsStrict({
              registrar: registrarAddress,
              voter: voterAddress,
              voterAuthority: publicKey!,
              voterWeightRecord,
              payer: publicKey!,
              systemProgram: SYSTEM_PROGRAM_ID,
              rent: SYSVAR_RENT_PUBKEY,
              instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
            })
            .instruction()
        );
      }

      if (depositIndex === undefined) {
        if (vsrVoterData.voter) {
          for (let i = 0; i < vsrVoterData.voter.deposits.length; i++) {
            if (!vsrVoterData.voter.deposits[i].isUsed) {
              depositIndex = i;
              break;
            }
          }
          if (depositIndex === undefined) {
            throw new Error('No available deposit slot');
          }
        } else {
          depositIndex = 0;
        }

        tx.add(
          await vsr.methods
            .createDepositEntry(depositIndex, {none: {}}, null, 0, true)
            .accountsStrict({
              registrar: registrarAddress,
              voter: voterAddress,
              voterAuthority: publicKey!,
              vault,
              payer: publicKey!,
              depositMint: rootData.registrar.votingMints[configIndex].mint,
              systemProgram: SYSTEM_PROGRAM_ID,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction()
        );
      }
      tx.add(
        await vsr.methods
          .deposit(depositIndex, balance)
          .accountsStrict({
            voter: voterAddress,
            registrar: registrarAddress,
            vault,
            tokenProgram: TOKEN_PROGRAM_ID,
            depositToken: getAssociatedTokenAddressSync(
              rootData.registrar.votingMints[configIndex].mint,
              publicKey!
            ),
            depositAuthority: publicKey!,
          })
          .instruction()
      );

      const signature = await sendTransaction(tx, connection);
      const result = await connection.confirmTransaction({
        signature: signature,
        blockhash: tx.recentBlockhash!,
        lastValidBlockHeight: tx.lastValidBlockHeight!,
      });
      if (result.value.err) {
        throw new Error(result.value.err.toString());
      }
    },
    onSuccess: (_, {network, rootAddress}) => {
      queryClient.invalidateQueries(
        vsrVoterQueryOptions({
          network,
          root: rootAddress,
          owner: publicKey!,
          queryClient,
        })
      );
    },
  });
};

export default useDepositToVsr;
