import {Box, Button, TextField} from '@mui/material';
import {useNavigate} from '@tanstack/react-router';
import {useState} from 'react';
import {PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {Route} from '../../routes/$rootId/clan/$clanId/transfer';
import { clanQueryOptions } from '../../queryOptions';
import useSetClanOwner from '../../hooks/useSetClanOwner';

const TransferClan = () => {
  const {network} = Route.useSearch();
  const {rootId, clanId} = Route.useParams();
  const root = new PublicKey(rootId);
  const clan = new PublicKey(clanId);
  const queryClient = useQueryClient();
  const {data: clanData} = useSuspenseQuery(
    clanQueryOptions({network, root, clan, queryClient})
  );

  const [newOwner, setNewOwner] = useState(clanData.owner.toBase58());

  const navigate = useNavigate();

  const mutation = useSetClanOwner();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    mutation.mutate(
      {network, root, clan, newOwner: new PublicKey(newOwner)},
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
        value={newOwner}
        onChange={event => setNewOwner(event.target.value)}
      />
      <Button type="submit">Transfer</Button>
    </Box>
  );
};

export default TransferClan;
