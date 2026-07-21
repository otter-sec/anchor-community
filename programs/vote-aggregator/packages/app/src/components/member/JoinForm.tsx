import {List, ListItem, Paper} from '@mui/material';
import {useJoinCandidatesContext} from '../../contexts/JoinCandidatesContext';
import {Link} from '@tanstack/react-router';
import {Cluster, PublicKey} from '@solana/web3.js';
import {ClanInfo} from '../../fetchers/fetchClanList';
import {ChangeEvent, FormEventHandler} from 'react';
import useJoinClans from '../../hooks/useJoinClans';
import {useWallet} from '@solana/wallet-adapter-react';
import {useSuspenseQuery} from '@tanstack/react-query';
import {
  memberQueryOptions,
  voteAggregatorQueryOptions,
} from '../../queryOptions';

const JoinForm = ({
  network,
  root,
  freeShareBp,
}: {
  network: Cluster;
  root: PublicKey;
  freeShareBp: number;
}) => {
  const {publicKey} = useWallet();
  const {candidates, setCandidates} = useJoinCandidatesContext();

  const handleChangeShare =
    (clan: ClanInfo) => (event: ChangeEvent<HTMLInputElement>) =>
      setCandidates(candidates =>
        candidates.map(c =>
          c.clan.address.equals(clan.address)
            ? {clan, share: parseInt(event.target.value)}
            : c
        )
      );

  const mutation = useJoinClans();
  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({network, root})
  );
  const {data: memberData} = useSuspenseQuery(
    memberQueryOptions({network, owner: publicKey!, root})
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    mutation.mutate({
      network,
      owner: publicKey!,
      rootAddress: root,
      rootData,
      freeShareBp,
      clans: candidates.map(({clan, share}) => ({
        address: clan.address,
        share,
      })),
      createMember: !memberData,
    });
  };

  return (
    <Paper component="form" onSubmit={handleSubmit}>
      Free share for joining {freeShareBp / 100}%{' '}
      <List>
        {candidates.map(({clan, share}) => (
          <ListItem
            key={clan.address.toBase58()}
            secondaryAction={
              <input
                type="number"
                aria-label="Demo number input"
                placeholder="Type a number…"
                value={share}
                onChange={handleChangeShare(clan)}
              />
            }
          >
            <Link
              to="/$rootId/clan/$clanId"
              params={{
                rootId: root.toBase58(),
                clanId: clan.address.toBase58(),
              }}
            >
              {clan.name}
            </Link>{' '}
            ({clan.address.toBase58()})
          </ListItem>
        ))}
      </List>
      <button type="submit" disabled={candidates.length === 0}>
        Join
      </button>
    </Paper>
  );
};

export default JoinForm;
