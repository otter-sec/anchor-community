import {Box, Button, Card, Typography} from '@mui/material';
import {Cluster, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import BN from 'bn.js';
import {VsrVoterInfo} from '../../fetchers/fetchVsrVoter';
import useDepositToVsr from '../../hooks/useDepositToVsr';
import {useSuspenseQuery} from '@tanstack/react-query';
import {voteAggregatorQueryOptions} from '../../queryOptions';
import useWithdrawFromVsr from '../../hooks/useWithdrawFromVsr';
import Airdrop from './Airdrop';

const VsrTokenStatus = ({
  network,
  rootAddress,
  vsrVoterData,
  mint,
  balance,
  configIndex,
  depositIndex,
}: {
  network: Cluster;
  rootAddress: PublicKey;
  vsrVoterData: VsrVoterInfo;
  mint: PublicKey;
  balance: BN;
  configIndex: number;
  depositIndex?: number;
}) => {
  const {data: rootData} = useSuspenseQuery(
    voteAggregatorQueryOptions({
      network,
      root: rootAddress,
    })
  );
  const depositMutation = useDepositToVsr();
  const withdrawMutation = useWithdrawFromVsr();

  const handleDeposit = () => {
    depositMutation.mutate({
      network,
      rootAddress,
      rootData,
      vsrVoterData,
      depositIndex,
      configIndex,
      balance,
    });
  };

  const handleWithdraw = () => {
    withdrawMutation.mutate({
      network,
      rootAddress,
      rootData,
      configIndex,
      depositIndex: depositIndex || 0,
      balance:
        vsrVoterData.voter!.deposits[depositIndex || 0].amountDepositedNative,
    });
  };

  return (
    <Card>
      <Typography>{mint.toBase58()}</Typography>
      {depositIndex !== undefined && (
        <Box>
          <Typography>
            Deposited:{' '}
            {parseFloat(
              vsrVoterData.voter!.deposits[
                depositIndex
              ].amountDepositedNative.toString()
            ) / LAMPORTS_PER_SOL}
          </Typography>
          <Button
            disabled={vsrVoterData.voter!.deposits[
              depositIndex
            ].amountDepositedNative.eqn(0)}
            onClick={handleWithdraw}
          >
            Withdraw
          </Button>
        </Box>
      )}
      {balance.gtn(0) && (
        <Box>
          <Typography>
            Free {parseFloat(balance.toString()) / LAMPORTS_PER_SOL}
          </Typography>
          <Button onClick={handleDeposit}>Deposit</Button>
        </Box>
      )}
      {network === 'devnet' && (
        <Airdrop network={network} mint={mint} root={rootAddress} />
      )}
    </Card>
  );
};

export default VsrTokenStatus;
