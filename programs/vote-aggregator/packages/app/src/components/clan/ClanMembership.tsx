/*
import {Box, Button} from '@mui/material';
import BN from 'bn.js';
import useJoinClan from '../../hooks/useJoinClan';
import useLeaveClan from '../../hooks/useLeaveClan';
import useStartLeavingClan from '../../hooks/useStartLeavingClan';
import {
  memberQueryOptions,
  voteAggregatorQueryOptions,
  vsrVoterQueryOptions,
} from '../../queryOptions';
import {Cluster, PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useWallet} from '@solana/wallet-adapter-react';

const ClanMembership = ({
  network,
  root,
  clan,
}: {
  network: Cluster;
  root: PublicKey;
  clan: PublicKey;
}) => {
  const {publicKey} = useWallet();
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }
  const queryClient = useQueryClient();
  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({network, root})
  );
  const {data: memberData} = useSuspenseQuery(
    memberQueryOptions({network, owner: publicKey, root})
  );
  const {data: vsrVoterData} = useSuspenseQuery(
    vsrVoterQueryOptions({network, owner: publicKey, root, queryClient})
  );
  const currentTime = new BN(Math.floor(Date.now() / 1000));

  const joinMutation = useJoinClan();
  const startLeavingMutation = useStartLeavingClan();
  const leaveMutation = useLeaveClan();

  const handleJoin = () => {
    joinMutation.mutate({
      network,
      owner: publicKey,
      rootAddress: root,
      rootData,
      clanAddress: clan,
      createMember: !memberData,
    });
  };
  const handleRequestExit = () => {
    if (!memberData) {
      throw new Error('Member data not found');
    }
    startLeavingMutation.mutate({
      network,
      memberData,
    });
  };

  const handleExit = () => {
    if (!memberData) {
      throw new Error('Member data not found');
    }

    leaveMutation.mutate({
      network,
      memberData,
    });
  };
  return (
    <Box>
      {(!memberData || memberData.clan.equals(PublicKey.default)) &&
        vsrVoterData.voter && <Button onClick={handleJoin}>Join</Button>}
      {memberData &&
        memberData.clan.equals(clan) &&
        (memberData.clanLeavingTime.eq(new BN('9223372036854775807')) ? (
          <Button onClick={handleRequestExit}>Request Exit</Button>
        ) : (
          <Button
            disabled={currentTime.lt(memberData.clanLeavingTime)}
            onClick={handleExit}
          >
            Exit
          </Button>
        ))}
    </Box>
  );
};

export default ClanMembership;
*/
