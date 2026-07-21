import {createFileRoute} from '@tanstack/react-router';
import {clanListQueryOptions} from '../../queryOptions';
import {PublicKey} from '@solana/web3.js';
import ClanList from '../../components/root/ClanList';

export const Route = createFileRoute('/$rootId/')({
  component: ClanList,
  loaderDeps: ({search: {network}}) => ({network}),
  loader: ({deps: {network}, params: {rootId}, context: {queryClient}}) =>
    queryClient.ensureQueryData(
      clanListQueryOptions({network, root: new PublicKey(rootId)})
    ),
});
