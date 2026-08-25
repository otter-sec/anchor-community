import {Cluster} from '@solana/web3.js';
import {FC, ReactNode, createContext, useState} from 'react';

export const NetworkContext = createContext<{
  network: Cluster;
  setNetwork: (network: Cluster) => void;
}>({
  network: 'devnet',
  setNetwork: undefined!,
});

// export const useNetworkContext = () => useContext(NetworkContext);

export const NetworkProvider: FC<{children: ReactNode}> = ({children}) => {
  const [network, setNetwork] = useState<Cluster>('devnet');

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
