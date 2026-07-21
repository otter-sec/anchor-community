import {createFileRoute} from '@tanstack/react-router';
import {clanQueryOptions} from '../../../../queryOptions';
import {PublicKey} from '@solana/web3.js';
import ClanDisplay from '../../../../components/clan/ClanDisplay';


export const Route = createFileRoute('/$rootId/clan/$clanId/')({
  component: ClanDisplay,
  loaderDeps: ({search: {network}}) => ({network}),
  loader: ({
    deps: {network},
    params: {rootId, clanId},
    context: {queryClient},
  }) =>
    queryClient.ensureQueryData(
      clanQueryOptions({
        network,
        root: new PublicKey(rootId),
        clan: new PublicKey(clanId),
        queryClient,
      })
    ),
  wrapInSuspense: true,
});
