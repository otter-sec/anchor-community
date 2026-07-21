import { Cluster, Connection, clusterApiUrl } from "@solana/web3.js";
import { VoteAggregatorSdk } from "vote-aggregator-sdk";

const sdkCache = new Map<Cluster, VoteAggregatorSdk>();

const voteAggregtorSdk = (network: Cluster) => {
  if (!sdkCache.has(network)) {
    const connection = new Connection(clusterApiUrl(network), {
      commitment: 'confirmed',
    });
    sdkCache.set(network, new VoteAggregatorSdk(connection));
  }
  return sdkCache.get(network)!;
}

export default voteAggregtorSdk;