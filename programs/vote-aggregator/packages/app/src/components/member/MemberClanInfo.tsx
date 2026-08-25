import {Box, IconButton, ListItem} from '@mui/material';
import BN from 'bn.js';
import {Cluster, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {
  clanQueryOptions,
  memberQueryOptions,
  voteAggregatorQueryOptions,
} from '../../queryOptions';
import {Link} from '@tanstack/react-router';
import {MembershipEntry} from 'vote-aggregator-sdk';
import RemoveIcon from '@mui/icons-material/Remove';
import useExitClan from '../../hooks/useExitClan';
import {useWallet} from '@solana/wallet-adapter-react';
import useStartLeavingClan from '../../hooks/useStartLeavingClan';
import LogoutIcon from '@mui/icons-material/Logout';

const MemberClanInfo = ({
  network,
  root,
  voterWeight,
  membership,
}: {
  network: Cluster;
  root: PublicKey;
  voterWeight: BN;
  membership: MembershipEntry;
}) => {
  const queryClient = useQueryClient();
  const {publicKey} = useWallet();

  const {data: clanData} = useSuspenseQuery(
    clanQueryOptions({
      network,
      root,
      clan: membership.clan,
      queryClient,
    })
  );

  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({network, root})
  );

  const {data: memberData} = useSuspenseQuery(
    memberQueryOptions({
      network,
      root,
      owner: publicKey!,
    })
  );

  const startLeavingMutation = useStartLeavingClan();
  const exitMutation = useExitClan();

  const handleStartLeaving = () => {
    startLeavingMutation.mutate({
      network,
      clan: membership.clan,
      memberData: memberData!,
    });
  };
  const handleExit = () => {
    exitMutation.mutate({
      network,
      clan: membership.clan,
      rootData,
      memberData: memberData!,
    });
  };

  const currentTime = new BN(Math.floor(Date.now() / 1000));
  const action = membership.exitableAt ? (
    membership.exitableAt.lte(currentTime) ? (
      <IconButton onClick={handleExit}>
        <LogoutIcon />
      </IconButton>
    ) : (
      <></>
    )
  ) : (
    <IconButton onClick={handleStartLeaving}>
      <RemoveIcon />
    </IconButton>
  );
  return (
    <ListItem secondaryAction={action}>
      <Box>
        {!membership.exitableAt ? 'Member of' : 'Leaving'} clan:{' '}
        <Link
          to="/$rootId/clan/$clanId"
          params={{
            rootId: root.toBase58(),
            clanId: membership.clan.toBase58(),
          }}
        >
          {clanData.name}
        </Link>{' '}
        ({membership.clan.toBase58()})
        {membership.exitableAt &&
          `at ${new Date(membership.exitableAt.toNumber() * 1000)}`}
      </Box>
      <Box>
        Power used:{' '}
        {parseFloat(
          voterWeight.muln(membership.shareBp).divn(10000).toString()
        ) / LAMPORTS_PER_SOL}
      </Box>
    </ListItem>
  );
};

export default MemberClanInfo;
