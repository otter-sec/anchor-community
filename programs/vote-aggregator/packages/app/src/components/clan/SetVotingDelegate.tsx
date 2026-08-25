import {Box, Button, TextField} from '@mui/material';
import {useNavigate} from '@tanstack/react-router';
import {useState} from 'react';
import {PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {Route} from '../../routes/$rootId/clan/$clanId/setVotingDelegate';
import { clanQueryOptions, voteAggregatorQueryOptions } from '../../queryOptions';
import useSetVotingDelegate from '../../hooks/useSetVotingDelegate';

const SetVotingDelegate = () => {
  const {network} = Route.useSearch();
  const {rootId, clanId} = Route.useParams();
  const root = new PublicKey(rootId);
  const clan = new PublicKey(clanId);
  const queryClient = useQueryClient();
  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({network, root})
  );
  const {data: clanData} = useSuspenseQuery(
    clanQueryOptions({network, root, clan, queryClient})
  );

  const [newVotingDelegate, setNewVotingDelegate] = useState(
    clanData.governanceDelegate?.toBase58() || ''
  );

  const navigate = useNavigate();

  const mutation = useSetVotingDelegate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    mutation.mutate(
      {
        network,
        rootAddress: root,
        rootData,
        clan,
        newVotingDelegate: newVotingDelegate
          ? new PublicKey(newVotingDelegate)
          : null,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/$rootId/clan/$clanId',
            params: {
              rootId: root.toBase58(),
              clanId: clan.toBase58(),
            },
          });
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        name="name"
        label="Name"
        value={newVotingDelegate}
        onChange={event => setNewVotingDelegate(event.target.value)}
      />
      <Button type="submit">Delegate</Button>
    </Box>
  );
};

export default SetVotingDelegate;
