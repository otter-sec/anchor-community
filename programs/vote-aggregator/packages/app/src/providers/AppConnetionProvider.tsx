
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {FC, ReactNode, useContext, useMemo} from 'react';
import { NetworkContext } from '../contexts/NetworkContext';

const AppConnectionProvider: FC<{children?: ReactNode}> = ({children}) => {
  const { network } = useContext(NetworkContext);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>
  );
};

export default AppConnectionProvider;
