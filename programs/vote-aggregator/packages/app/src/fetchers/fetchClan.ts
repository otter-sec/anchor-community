import {Cluster, PublicKey} from '@solana/web3.js';
import voteAggregtorSdk from './voteAggregatorSdk';
import BN from 'bn.js';
import {ClanInfo} from './fetchClanList';

export type DetailedClanInfo = ClanInfo & {
  voterWeight: BN;
  voterWeightExpiry: BN | null;
  governanceDelegate: PublicKey | null;
};

const fetchClan = async ({
  network,
  rootData,
  clan,
}: {
  network: Cluster;
  rootData: {
    governanceProgram: PublicKey;
    realm: PublicKey;
    governingTokenMint: PublicKey;
  };
  clan: PublicKey;
}): Promise<DetailedClanInfo> => {
  const sdk = voteAggregtorSdk(network);
  const clanData = await sdk.clan.fetchClan(clan);
  const vwr = await sdk.clan.fetchVoterWeight({clanAddress: clan});
  const tor = await sdk.clan.fetchTokenOwnerRecord({
    rootData,
    clanAddress: clan,
  });

  return {
    address: clan,
    root: clanData.root,
    owner: clanData.owner,
    delegate: clanData.delegate,
    voterAuthority: clanData.voterAuthority,
    tokenOwnerRecord: clanData.tokenOwnerRecord,
    voterWeightRecord: clanData.voterWeightRecord,
    minVotingWeightToJoin: clanData.minVotingWeightToJoin,
    permanentMembers: clanData.permanentMembers,
    temporaryMembers: clanData.temporaryMembers,
    updatedTemporaryMembers: clanData.updatedTemporaryMembers,
    leavingMembers: clanData.leavingMembers,
    nextVoterWeightResetTime: clanData.nextVoterWeightResetTime,
    acceptTemporaryMembers: clanData.acceptTemporaryMembers,
    name: clanData.name,
    description: clanData.description,
    voterWeight: vwr.voterWeight,
    voterWeightExpiry: vwr.voterWeightExpiry,
    governanceDelegate: tor.account.governanceDelegate || null,
  };
};

export default fetchClan;
