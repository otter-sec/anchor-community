import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {ClanInfo} from '../fetchers/fetchClanList';
import {PublicKey} from '@solana/web3.js';
import {useWallet} from '@solana/wallet-adapter-react';

export type JoinCandidates = {
  clan: ClanInfo;
  share: number;
}[];

export const JoinCandidatesContext = createContext<{
  candidates: JoinCandidates;
  setCandidates: Dispatch<SetStateAction<JoinCandidates>>;
}>({
  candidates: [],
  setCandidates: () => {},
});

export const JoinCandidatesProvider: FC<{
  root: PublicKey;
  children: ReactNode;
}> = ({root, children}) => {
  const {publicKey} = useWallet();
  const [candidates, setCandidates] = useState<JoinCandidates>([]);

  useEffect(() => {
    setCandidates([]);
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    root.toBase58(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    publicKey?.toBase58(),
  ]);

  return (
    <JoinCandidatesContext.Provider value={{candidates, setCandidates}}>
      {children}
    </JoinCandidatesContext.Provider>
  );
};

export const useJoinCandidatesContext = () => useContext(JoinCandidatesContext);
