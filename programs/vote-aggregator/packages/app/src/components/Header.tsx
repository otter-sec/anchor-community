import {
  AppBar,
  Breadcrumbs,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {WalletMultiButton} from '@solana/wallet-adapter-material-ui';
import {Cluster} from '@solana/web3.js';
import {Link, useMatches} from '@tanstack/react-router';
import {FC} from 'react';

const Header: FC<{
  network: Cluster;
  setNetwork: (network: Cluster) => void;
}> = ({network, setNetwork}) => {
  const handleNetworkChange = (event: SelectChangeEvent) => {
    setNetwork(event.target.value as Cluster);
  };
  const matches = useMatches();
  const breadcrumbs = matches
    .map(({pathname, routeContext, params}) => {
      return {
        title: (routeContext as {title: string | undefined}).title,
        path: pathname,
        params,
      };
    })
    .filter(({title}) => title);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbs.map(({title, path, params}, index) =>
              index === breadcrumbs.length - 1 ? (
                <Typography color="text.primary" key={path}>
                  {title}
                </Typography>
              ) : (
                <Link key={path} to={path} params={params}>
                  {title}
                </Link>
              )
            )}
          </Breadcrumbs>
          <Stack direction="row" sx={{marginLeft: 'auto'}}>
            <FormControl variant="standard">
              <InputLabel
                id="network-label"
                sx={{paddingTop: '0.3em', marginRight: '1em'}}
              >
                Network:
              </InputLabel>
              <Select
                labelId="network-label"
                value={network}
                onChange={handleNetworkChange}
                label="Age"
              >
                <MenuItem value="devnet">Devnet</MenuItem>
                <MenuItem value="testnet">Testnet</MenuItem>
              </Select>
            </FormControl>
            <WalletMultiButton color="secondary" sx={{marginLeft: 'auto'}} />
          </Stack>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default Header;
