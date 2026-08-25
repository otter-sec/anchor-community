import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
//import {useSnackbar} from 'notistack';
import {FC, useMemo} from 'react';

const AppQueryClientProvider: FC<{children?: React.ReactNode}> = ({
  children,
}) => {
  //const {enqueueSnackbar} = useSnackbar();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
          },
          mutations: {
            onError: error => {
              /*enqueueSnackbar(
                error.message ? `${error.name}: ${error.message}` : error.name,
                {variant: 'error'}
              );*/
              console.error(error);
            },
          },
        },
      }),
    []//[enqueueSnackbar]
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default AppQueryClientProvider;
