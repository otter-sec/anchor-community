import {
  Outlet,
  createRootRouteWithContext,
  useNavigate,
} from '@tanstack/react-router';
import Header from '../components/Header';
import {TanStackRouterDevtools} from '@tanstack/router-devtools';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {QueryClient} from '@tanstack/react-query';
import {Cluster} from '@solana/web3.js';
import {Container, CssBaseline} from '@mui/material';
import {z} from 'zod';
import {Suspense, useCallback, useContext, useEffect} from 'react';
import {NetworkContext} from '../contexts/NetworkContext';

const RootComponent = () => {
  const search = Route.useSearch();
  const navigate = useNavigate({from: Route.fullPath});

  const {network, setNetwork} = useContext(NetworkContext);

  useEffect(() => {
    if (search.network !== network) {
      setNetwork(search.network);
    }
  }, [setNetwork, search.network, network]);

  const handleSetNetwork = useCallback(
    (network: Cluster) => {
      navigate({
        search: {
          network,
        },
      });
    },
    [navigate]
  );

  return (
    <>
      <CssBaseline />
      <Header network={network} setNetwork={handleSetNetwork} />
      <Container sx={{width: '100%', ml: 1, mt: 2}}>
        <Suspense>
          <Outlet />
        </Suspense>
      </Container>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  validateSearch: z.object({
    network: z.enum(['devnet', 'testnet', 'mainnet-beta']).catch('devnet'),
  }),
  preSearchFilters: [
    search => ({
      ...search,
    }),
  ],
  beforeLoad: () => {
    return {
      title: 'Vote Aggregator',
    };
  },
});

//
// <ClanList sx={{width: '100%', ml: 10}} />
