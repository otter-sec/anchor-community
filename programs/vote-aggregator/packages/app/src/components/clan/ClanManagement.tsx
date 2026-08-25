import {Box, Button} from '@mui/material';
import {useWallet} from '@solana/wallet-adapter-react';
import {PublicKey} from '@solana/web3.js';
import {Link} from '@tanstack/react-router';

const ClanManagement = ({root, clan}: {root: PublicKey; clan: PublicKey}) => {
  const {publicKey} = useWallet();
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }

  return (
    <Box>
      <Button
        component={Link}
        to="/$rootId/clan/$clanId/edit"
        params={{
          rootId: root.toBase58(),
          clanId: clan.toBase58(),
        }}
      >
        Edit
      </Button>
      &nbsp;
      <Button
        component={Link}
        to="/$rootId/clan/$clanId/transfer"
        params={{
          rootId: root.toBase58(),
          clanId: clan.toBase58(),
        }}
      >
        Transfer
      </Button>
      <Button
        component={Link}
        to="/$rootId/clan/$clanId/setVotingDelegate"
        params={{
          rootId: root.toBase58(),
          clanId: clan.toBase58(),
        }}
      >
        Delegate voting
      </Button>
    </Box>
  );
};

export default ClanManagement;
