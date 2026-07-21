import { Cluster, PublicKey } from "@solana/web3.js";
import voteAggregtorSdk from "./voteAggregatorSdk";
import { RootInfo } from "./fetchVoteAggregatorList";
import { getRealm } from "@solana/spl-governance";
import vsrSdk, { RegistrarAccount } from "./vsrSdk";

export type DetailedRootInfo = RootInfo & {
  registrar: RegistrarAccount;
}

const fetchVoteAggregator = async ({
  network,
  root,
}: {
  network: Cluster;
  root: PublicKey;
}): Promise<DetailedRootInfo> => {
  const voteAggregator = voteAggregtorSdk(network);
  const rootData = await voteAggregator.root.fetchRoot(root);
  const vsr = vsrSdk({ network, vsrProgram: rootData.votingWeightPlugin });
  // TODO: memoize this
  const realmData = await getRealm(voteAggregator.connection, rootData.realm);
  const [registrarAddress] = PublicKey.findProgramAddressSync(
    [
      rootData.realm.toBuffer(),
      Buffer.from('registrar', 'utf-8'),
      rootData.governingTokenMint.toBuffer(),
    ],
    rootData.votingWeightPlugin
  );
  const registrar = await vsr.account.registrar.fetch(registrarAddress);
  
  return {
    ...rootData,
    address: root,
    realmData: realmData.account,
    side: rootData.governingTokenMint.equals(realmData.account.communityMint)
      ? 'community'
      : 'council',
    registrar,
  }
}

export default fetchVoteAggregator;
