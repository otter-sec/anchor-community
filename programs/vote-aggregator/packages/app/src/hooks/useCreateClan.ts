import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, Keypair, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {clanListQueryOptions} from '../queryOptions';

const useCreateClan = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rootAddress,
      rootData,
      name,
      description,
    }: {
      network: Cluster;
      rootAddress: PublicKey;
      rootData: {
        governanceProgram: PublicKey;
        realm: PublicKey;
        governingTokenMint: PublicKey;
      };
      name: string;
      description: string;
    }) => {
      const sdk = new VoteAggregatorSdk(connection);
      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: publicKey!,
        blockhash,
        lastValidBlockHeight,
      });
      const clanAddress = Keypair.generate();
      tx.add(
        await sdk.clan.createClanInstruction({
          rootData,
          rootAddress,
          clanAddress: clanAddress.publicKey,
          owner: publicKey!,
          payer: publicKey!,
        })
      );
      if (name || description) {
        tx.add(
          await sdk.clan.resizeClanInstruction({
            clanAddress: clanAddress.publicKey,
            clanAuthority: publicKey!,
            payer: publicKey!,
            size: 288 + name.length + description.length,
          })
        );
        if (name) {
          tx.add(
            await sdk.clan.setClanNameInstruction({
              clanAddress: clanAddress.publicKey,
              clanAuthority: publicKey!,
              name,
            })
          );
        }
        if (description) {
          tx.add(
            await sdk.clan.setClanDescriptionInstruction({
              clanAddress: clanAddress.publicKey,
              clanAuthority: publicKey!,
              description,
            })
          );
        }
      }
      tx.add(
        await sdk.clan.setVotingDelegateInstruction({
          rootAddress,
          rootData,
          clanAddress: clanAddress.publicKey,
          clanAuthority: publicKey!,
          newVotingDelegate: publicKey!,
        })
      );

      tx.partialSign(clanAddress);
      const signature = await sendTransaction(tx, connection);
      const result = await connection.confirmTransaction({
        signature: signature,
        blockhash: tx.recentBlockhash!,
        lastValidBlockHeight: tx.lastValidBlockHeight!,
      });
      if (result.value.err) {
        throw new Error(result.value.err.toString());
      }
      return {clan: clanAddress.publicKey};
    },
    onSuccess: (_, {network, rootAddress}) => {
      queryClient.invalidateQueries(
        clanListQueryOptions({network, root: rootAddress})
      );
    },
  });
};

export default useCreateClan;
