import {Button} from '@mui/material';
import {Cluster, PublicKey} from '@solana/web3.js';
import useAirdrop from '../../hooks/useAirdrop';

const Airdrop = ({
  network,
  mint,
  root,
}: {
  network: Cluster;
  mint: PublicKey;
  root: PublicKey;
}) => {
  const mutation = useAirdrop();
  const handleAirdrop = () => {
    mutation.mutate({network, mint, root});
  };
  return <Button onClick={handleAirdrop}>Airdrop</Button>;
};

export default Airdrop;
