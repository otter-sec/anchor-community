import { Cluster, PublicKey } from "@solana/web3.js";
import voteAggregtorSdk from "./voteAggregatorSdk";
import BN from "bn.js";

export type ClanInfo = {
  address: PublicKey;
  root: PublicKey;
  owner: PublicKey;
  delegate: PublicKey;
  voterAuthority: PublicKey;
  tokenOwnerRecord: PublicKey;
  voterWeightRecord: PublicKey;
  minVotingWeightToJoin: BN;
  permanentMembers: BN;
  temporaryMembers: BN;
  updatedTemporaryMembers: BN;
  leavingMembers: BN;
  nextVoterWeightResetTime: BN | null;
  acceptTemporaryMembers: boolean;
  name: string;
  description: string;
};

const fetchClanList = async ({
  network,
  root,
}: {
  network: Cluster;
  root: PublicKey;
}): Promise<ClanInfo[]> => {
  const sdk = voteAggregtorSdk(network);
  const clans = await sdk.clan.fetchClans({
    root,
  });
  return clans.map((clan) => ({
    address: clan.publicKey,
    root: clan.account.root,
    owner: clan.account.owner,
    delegate: clan.account.delegate,
    voterAuthority: clan.account.voterAuthority,
    tokenOwnerRecord: clan.account.tokenOwnerRecord,
    voterWeightRecord: clan.account.voterWeightRecord,
    minVotingWeightToJoin: clan.account.minVotingWeightToJoin,
    permanentMembers: clan.account.permanentMembers,
    temporaryMembers: clan.account.temporaryMembers,
    updatedTemporaryMembers: clan.account.updatedTemporaryMembers,
    leavingMembers: clan.account.leavingMembers,
    nextVoterWeightResetTime: clan.account.nextVoterWeightResetTime,
    acceptTemporaryMembers: clan.account.acceptTemporaryMembers,
    name: clan.account.name,
    description: clan.account.description,
  }));
}

export default fetchClanList;