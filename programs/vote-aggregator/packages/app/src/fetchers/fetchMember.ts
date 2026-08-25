import {Cluster, PublicKey} from '@solana/web3.js';
import voteAggregtorSdk from './voteAggregatorSdk';
import { MemberAccount } from 'vote-aggregator-sdk';

export type MemberInfo = MemberAccount;

const fetchMember = async ({
  network,
  root,
  owner,
}: {
  network: Cluster;
  root: PublicKey;
  owner: PublicKey;
}): Promise<MemberInfo | null> => {
  const sdk = voteAggregtorSdk(network);
  const member = await sdk.member.fetchMember({
    rootAddress: root,
    owner,
  });
  if (!member) {
    return null;
  }

  return {
    ...member,
  };
};

export default fetchMember;
