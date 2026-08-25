import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import {useNavigate} from '@tanstack/react-router';
import {useState} from 'react';
import {PublicKey} from '@solana/web3.js';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {Route} from '../../routes/$rootId/clan/$clanId/edit';
import {clanQueryOptions} from '../../queryOptions';
import useConfigureClan from '../../hooks/useConfigureClan';
import BN from 'bn.js';

const EditClan = () => {
  const {network} = Route.useSearch();
  const {rootId, clanId} = Route.useParams();
  const root = new PublicKey(rootId);
  const clan = new PublicKey(clanId);
  const queryClient = useQueryClient();
  const {data: clanData} = useSuspenseQuery(
    clanQueryOptions({network, root, clan, queryClient})
  );

  const [name, setName] = useState(clanData!.name);
  const [description, setDescription] = useState(clanData!.description);
  const [delegate, setDelegate] = useState(clanData!.delegate.toBase58());
  const [minVotingWeightToJoin, setMinVotingWeightToJoin] = useState(
    clanData!.minVotingWeightToJoin.toString()
  );
  const [acceptTemporaryMembers, setAcceptTemporaryMembers] = useState(
    clanData!.acceptTemporaryMembers
  );

  const navigate = useNavigate();

  const mutation = useConfigureClan();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    mutation.mutate(
      {
        network,
        root,
        clan,
        clanData,
        name,
        description,
        delegate: new PublicKey(delegate),
        minVotingWeightToJoin: new BN(minVotingWeightToJoin),
        acceptTemporaryMembers,
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
      <Stack spacing={2}>
      <TextField
        name="name"
        label="Name"
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <TextField
        name="description"
        label="Description"
        fullWidth
        sx={{mt: 1}}
        value={description}
        onChange={event => setDescription(event.target.value)}
      />
      <TextField
        name="delegate"
        label="Delegate"
        value={delegate}
        onChange={event => setDelegate(event.target.value)}
      />
      <TextField
        name="minVotingWeightToJoin"
        label="Min Voting Weight To Join"
        value={minVotingWeightToJoin}
        onChange={event => setMinVotingWeightToJoin(event.target.value)}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={acceptTemporaryMembers}
            onChange={event => setAcceptTemporaryMembers(event.target.checked)}
          />
        }
        label="Accept temporary members"
      />
      <Button type="submit">Edit</Button>
      </Stack>
    </Box>
  );
};

export default EditClan;
