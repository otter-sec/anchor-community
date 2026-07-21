import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Cluster, PublicKey, Transaction} from '@solana/web3.js';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {clanListQueryOptions, clanQueryOptions} from '../queryOptions';
import BN from 'bn.js';

const useConfigureClan = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clan,
      clanData,
      name,
      description,
      delegate,
      minVotingWeightToJoin,
      acceptTemporaryMembers,
    }: {
      network: Cluster;
      root: PublicKey;
      clan: PublicKey;
      clanData: {
        name: string;
        description: string;
        delegate: PublicKey;
        minVotingWeightToJoin: BN;
        acceptTemporaryMembers: boolean;
      };
      name: string;
      description: string;
      delegate: PublicKey;
      minVotingWeightToJoin: BN;
      acceptTemporaryMembers: boolean;
    }) => {
      const sdk = new VoteAggregatorSdk(connection);
      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: publicKey!,
        blockhash,
        lastValidBlockHeight,
      });
      if (name !== clanData.name || description !== clanData.description) {
        tx.add(
          await sdk.clan.resizeClanInstruction({
            clanAddress: clan,
            clanAuthority: publicKey!,
            payer: publicKey!,
            size: 288 + name.length + description.length,
          })
        );
        if (name !== clanData.name) {
          tx.add(
            await sdk.clan.setClanNameInstruction({
              clanAddress: clan,
              clanAuthority: publicKey!,
              name,
            })
          );
        }
        if (description !== clanData.description) {
          tx.add(
            await sdk.clan.setClanDescriptionInstruction({
              clanAddress: clan,
              clanAuthority: publicKey!,
              description,
            })
          );
        }
      }

      if (!delegate.equals(clanData.delegate)) {
        tx.add(
          await sdk.clan.setClanDelegateInstruction({
            clanAddress: clan,
            clanAuthority: publicKey!,
            delegate,
          })
        );
      }

      if (!minVotingWeightToJoin.eq(clanData.minVotingWeightToJoin)) {
        tx.add(
          await sdk.clan.setClanMinVotingWeightToJoinInstruction({
            clanAddress: clan,
            clanAuthority: publicKey!,
            minVotingWeightToJoin,
          })
        );
      }

      if (acceptTemporaryMembers !== clanData.acceptTemporaryMembers) {
        tx.add(
          await sdk.clan.setClanAcceptTemporaryMembersInstruction({
            clanAddress: clan,
            clanAuthority: publicKey!,
            acceptTemporaryMembers,
          })
        );
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

export default useConfigureClan;
