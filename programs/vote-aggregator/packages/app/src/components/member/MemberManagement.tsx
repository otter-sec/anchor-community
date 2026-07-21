import {Box, Button, List, Paper} from '@mui/material';
import {Cluster, PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {
  memberQueryOptions,
  voteAggregatorQueryOptions,
  vsrVoterQueryOptions,
} from '../../queryOptions';
import {useWallet} from '@solana/wallet-adapter-react';
import MemberClanInfo from './MemberClanInfo';
import VsrTokenStatus from './VsrTokenStatus';
import {useMemo} from 'react';
import JoinForm from './JoinForm';
import BN from 'bn.js';
import useStartLeavingAll from '../../hooks/useStartLeavingAll';
import useExitAll from '../../hooks/useExitAll';

const MemberManagement = ({
  network,
  root,
}: {
  network: Cluster;
  root: PublicKey;
}) => {
  const {publicKey} = useWallet();
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }
  const queryClient = useQueryClient();

  const {data: memberData} = useSuspenseQuery(
    memberQueryOptions({network, owner: publicKey!, root})
  );

  const {data: vsrVoterData} = useSuspenseQuery(
    vsrVoterQueryOptions({network, owner: publicKey!, root, queryClient})
  );

  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({network, root})
  );

  const freeShareBp = useMemo(() => {
    if (!memberData?.membership) {
      return 10000;
    }
    return (
      10000 -
      memberData.membership.reduce(
        (acc, membership) => acc + membership.shareBp,
        0
      )
    );
  }, [memberData?.membership]);

  const currentTime = new BN(Math.floor(Date.now() / 1000));
  const activeClanCount =
    memberData?.membership.filter(({exitableAt}) => !exitableAt).length || 0;
  /*
  const leavingClanCount = memberData?.membership.filter(
    ({exitableAt}) => exitableAt && exitableAt.gt(currentTime)
  ).length;
  */
  const readyToExitClanCount =
    memberData?.membership.filter(
      ({exitableAt}) => exitableAt && exitableAt.lte(currentTime)
    ).length || 0;

  const startLeavingAllMutation = useStartLeavingAll();
  const handleStartLeavingAll = () => {
    startLeavingAllMutation.mutate({
      network,
      memberData: memberData!,
    });
  };

  const leaveAllMutation = useExitAll();
  const handleLeaveAll = () => {
    leaveAllMutation.mutate({
      network,
      memberData: memberData!,
      rootData,
    });
  };

  return (
    <Box sx={{mt: 5}}>
      <Box>Your governance power</Box>
      <Paper>
        {vsrVoterData.tokenStatuses.map(
          ({mint, balance, configIndex, depositIndex}) => (
            <VsrTokenStatus
              key={mint.toBase58()}
              vsrVoterData={vsrVoterData}
              mint={mint}
              balance={balance}
              depositIndex={depositIndex}
              network={network}
              rootAddress={root}
              configIndex={configIndex}
            />
          )
        )}
      </Paper>
      <Paper>
        Clan membership:
        <List>
          {memberData?.membership.map(membership => (
            <MemberClanInfo
              key={membership.clan.toBase58()}
              network={network}
              root={root}
              voterWeight={memberData.voterWeight}
              membership={membership}
            />
          ))}
        </List>
      </Paper>
      {activeClanCount > 0 ? (
        <Button onClick={handleStartLeavingAll}>Start leaving clans</Button>
      ) : (
        <></>
      )}
      {readyToExitClanCount > 0 ? (
        <Button onClick={handleLeaveAll}>Exit all clans</Button>
      ) : (
        <></>
      )}
      {freeShareBp > 0 ? (
        <JoinForm network={network} root={root} freeShareBp={freeShareBp} />
      ) : (
        <Box>You have no power to join the clans</Box>
      )}
    </Box>
  );
};

export default MemberManagement;
