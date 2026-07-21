import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {MembershipEntry, VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {memberQueryOptions} from '../queryOptions';
import {BN} from 'bn.js';

const useExitAll = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberData,
      rootData,
    }: {
      network: Cluster;
      rootData: {
        governanceProgram: PublicKey;
        realm: PublicKey;
        governingTokenMint: PublicKey;
      };
      memberData: {
        root: PublicKey;
        owner: PublicKey;
        membership: MembershipEntry[];
      };
    }) => {
      const sdk = new VoteAggregatorSdk(connection);
      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: publicKey!,
        blockhash,
        lastValidBlockHeight,
      });

      const currentTime = new BN(Math.floor(Date.now() / 1000));
      const clans = [];
      for (const {clan, exitableAt} of memberData.membership) {
        if (exitableAt && exitableAt.lte(currentTime)) {
          clans.push(clan);
          tx.add(
            await sdk.member.exitClanInstruction({
              rootData,
              memberData,
              clan,
            })
          );
        }
      }

      const signature = await sendTransaction(tx, connection);
      const result = await connection.confirmTransaction({
        signature: signature,
        blockhash: tx.recentBlockhash!,
        lastValidBlockHeight: tx.lastValidBlockHeight!,
      });
      if (result.value.err) {
        throw new Error(result.value.err.toString());
      }
      return {signature, clans};
    },
    onSuccess: (_, {network, memberData}) => {
      queryClient.invalidateQueries(
        memberQueryOptions({
          network,
          root: memberData.root,
          owner: memberData.owner,
        })
      );
    },
  });
};

export default useExitAll;
