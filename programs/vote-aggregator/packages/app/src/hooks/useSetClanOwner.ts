import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {clanListQueryOptions, clanQueryOptions} from '../queryOptions';

const useSetClanOwner = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clan,
      newOwner,
    }: {
      network: Cluster;
      root: PublicKey;
      clan: PublicKey;
      newOwner: PublicKey;
    }) => {
      const sdk = new VoteAggregatorSdk(connection);
      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: publicKey!,
        blockhash,
        lastValidBlockHeight,
      });
      tx.add(
        await sdk.clan.setClanOwnerInstruction({
          clanAddress: clan,
          owner: publicKey!,
          newOwner: newOwner,
        })
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
    onSuccess: (_, {network, root, clan}) => {
      queryClient.invalidateQueries(
        clanQueryOptions({
          network,
          root,
          clan,
          queryClient,
        })
      );
      queryClient.invalidateQueries(clanListQueryOptions({network, root}));
    },
  });
};

export default useSetClanOwner;
