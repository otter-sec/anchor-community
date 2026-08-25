import {Cluster, PublicKey} from '@solana/web3.js';
import voteAggregtorSdk from './voteAggregatorSdk';
import {Realm, getRealm} from '@solana/spl-governance';
import {RealmSide, RootAccount} from 'vote-aggregator-sdk';

export type RootInfo = {
  address: PublicKey;
  realm: PublicKey;
  realmData: Realm;
  side: RealmSide;
} & RootAccount;

const fetchVoteAggregatorList = async ({
  network,
}: {
  network: Cluster;
}): Promise<RootInfo[]> => {
  const sdk = voteAggregtorSdk(network);
  const roots = await sdk.root.fetchRoots({});
  const result: RootInfo[] = [];
  for (const {publicKey, account} of roots) {
    const realmData = await getRealm(sdk.connection, account.realm);
    result.push({
      ...account,
      address: publicKey,
      realmData: realmData.account,
      side: account.governingTokenMint.equals(realmData.account.communityMint)
        ? 'community'
        : 'council',
    });
  }

  return result;
};

export default fetchVoteAggregatorList;
