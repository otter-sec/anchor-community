import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {SplTfSdk} from '../devnet/SplTfSdk';
import {vsrVoterQueryOptions} from '../queryOptions';

const useAirdrop = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const splTf = new SplTfSdk({
    connection,
  });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mint,
    }: {
      network: Cluster;
      mint: PublicKey;
      root: PublicKey;
    }) => {
      const tx = await splTf.airdrop({mint, payer: publicKey!});
      tx.feePayer = publicKey!;
      const {lastValidBlockHeight, blockhash} =
        await connection.getLatestBlockhash();
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.recentBlockhash = blockhash;
      const signature = await sendTransaction(tx, connection);
      const result = await connection.confirmTransaction({
        signature: signature,
        blockhash,
        lastValidBlockHeight,
      });
      if (result.value.err) {
        throw new Error(result.value.err.toString());
      }
    },
    onSuccess: (_, {network, root}) => {
      queryClient.invalidateQueries(
        vsrVoterQueryOptions({
          queryClient,
          network,
          root,
          owner: publicKey!,
        })
      );
    },
  });
};

export default useAirdrop;
