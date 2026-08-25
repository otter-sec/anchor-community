import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {MembershipEntry, VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {clanQueryOptions, memberQueryOptions} from '../queryOptions';
import vsrSdk from '../fetchers/vsrSdk';
import {
  PROGRAM_VERSION_V3,
  SYSTEM_PROGRAM_ID,
  getTokenOwnerRecordAddress,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import {AnchorProvider} from '@coral-xyz/anchor';

const useJoinClans = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      network,
      owner,
      rootAddress,
      rootData,
      clans,
      freeShareBp,
      createMember,
    }: {
      network: Cluster;
      owner: PublicKey;
      rootData: {
        governanceProgram: PublicKey;
        realm: PublicKey;
        governingTokenMint: PublicKey;
        votingWeightPlugin: PublicKey;
      };
      rootAddress: PublicKey;
      clans: {address: PublicKey; share: number}[];
      freeShareBp: number;
      createMember: boolean;
    }) => {
      const sdk = new VoteAggregatorSdk(connection);
      const vsr = vsrSdk({network, vsrProgram: rootData.votingWeightPlugin});
      const splGovernance = splGovernanceProgram({
        programId: rootData.governanceProgram,
        provider: new AnchorProvider(
          connection,
          {
            signTransaction: async t => t,
            signAllTransactions: async t => t,
            publicKey: owner,
          },
          {}
        ),
      });

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

      let memberData: {
        root: PublicKey;
        owner: PublicKey;
        tokenOwnerRecord?: PublicKey;
        membership: MembershipEntry[];
      };
      if (createMember) {
        tx.add(
          await sdk.member.createMemberInstruction({
            rootAddress,
            rootData,
            owner,
            payer: publicKey!,
          })
        );
        memberData = {
          root: rootAddress,
          owner,
          membership: [],
        };
      } else {
        memberData = (await sdk.member.fetchMember({
          rootAddress,
          owner,
        }))!;
      }

      /*
      const memberVoterWeightAddress = (
        await sdk.member.findVoterWeightRecord({
          rootData,
          owner,
        })
      ).pubkey;
      */
      const [registrarAddress] = PublicKey.findProgramAddressSync(
        [
          rootData.realm.toBuffer(),
          Buffer.from('registrar', 'utf-8'),
          rootData.governingTokenMint.toBuffer(),
        ],
        rootData.votingWeightPlugin
      );
      const [memberVwr] = PublicKey.findProgramAddressSync(
        [
          registrarAddress.toBuffer(),
          Buffer.from('voter-weight-record', 'utf-8'),
          publicKey!.toBuffer(),
        ],
        rootData.votingWeightPlugin
      );
      const [voterAddress] = PublicKey.findProgramAddressSync(
        [
          registrarAddress.toBuffer(),
          Buffer.from('voter', 'utf-8'),
          publicKey!.toBuffer(),
        ],
        rootData.votingWeightPlugin
      );
      tx.add(
        await vsr.methods
          .updateVoterWeightRecord()
          .accountsStrict({
            registrar: registrarAddress,
            voter: voterAddress,
            voterWeightRecord: memberVwr,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .instruction()
      );

      const totalShare = clans.reduce((acc, {share}) => acc + share, 0);

      const membership = [...memberData.membership];
      for (const {address, share} of clans) {
        const shareBp = (share * freeShareBp) / totalShare;
        tx.add(
          await sdk.member.joinClanInstruction({
            rootData,
            memberData: {
              ...memberData,
              membership,
            },
            clanAddress: address,
            memberVwr,
            payer: publicKey!,
            shareBp,
          })
        );
        membership.push({
          clan: address,
          shareBp,
          exitableAt: null,
        });
      }

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: true,
      });
      const result = await connection.confirmTransaction({
        signature: signature,
        blockhash: tx.recentBlockhash!,
        lastValidBlockHeight: tx.lastValidBlockHeight!,
      });
      if (result.value.err) {
        throw new Error(result.value.err.toString());
      }
    },
    onSuccess: (_, {network, rootAddress, owner, clans}) => {
      queryClient.invalidateQueries(
        memberQueryOptions({
          network,
          root: rootAddress,
          owner,
        })
      );
      for (const {address} of clans) {
        queryClient.invalidateQueries(
          clanQueryOptions({
            network,
            root: rootAddress,
            clan: address,
            queryClient,
          })
        );
      }
    },
  });
};

export default useJoinClans;
