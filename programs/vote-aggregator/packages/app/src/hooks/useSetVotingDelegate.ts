import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {clanQueryOptions} from '../queryOptions';

const useSetVotingDelegate = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rootAddress,
      rootData,
      clan,
      newVotingDelegate,
    }: {
      network: Cluster;
      rootAddress: PublicKey;
      rootData: {
        governanceProgram: PublicKey;
        realm: PublicKey;
        governingTokenMint: PublicKey;
      };
      clan: PublicKey;
      newVotingDelegate: PublicKey | null;
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
        await sdk.clan.setVotingDelegateInstruction({
          rootAddress,
          rootData,
          clanAddress: clan,
          clanAuthority: publicKey!,
          newVotingDelegate,
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
    onSuccess: (_, {network, rootAddress, clan}) => {
      queryClient.invalidateQueries(
        clanQueryOptions({
          network,
          root: rootAddress,
          clan,
          queryClient,
        })
      );
    },
  });
};

export default useSetVotingDelegate;
