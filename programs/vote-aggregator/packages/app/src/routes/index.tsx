import {createFileRoute} from '@tanstack/react-router';
import {voteAggregatorListQueryOptions} from '../queryOptions';
import {useSuspenseQuery} from '@tanstack/react-query';
import VoteAggregatorItem from '../components/root/VoteAggregatorItem';

const VoteAggregatorListComponent = () => {
  const {network} = Route.useSearch();
  const voteAggregators = useSuspenseQuery(
    voteAggregatorListQueryOptions({network})
  );
  return (
    <div>
      {voteAggregators.data.map(root => (
        <VoteAggregatorItem root={root} key={root.address.toBase58()}/>
      ))}
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: VoteAggregatorListComponent,
  loaderDeps: ({search: {network}}) => ({network}),
  loader: ({deps: {network}, context: {queryClient}}) =>
    queryClient.ensureQueryData(voteAggregatorListQueryOptions({network})),
  // wrapInSuspense: true,
});
