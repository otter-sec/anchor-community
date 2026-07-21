import {AnchorProvider, Provider, Wallet} from '@coral-xyz/anchor';
import expandTilde from 'expand-tilde';
import * as YAML from 'yaml';
import {fs} from 'mz';
import {Cluster, Commitment, Connection, clusterApiUrl} from '@solana/web3.js';
import {VoteAggregatorSdk} from 'vote-aggregator-sdk';
import {parseKeypair} from './keyParser';

export interface IContext {
  provider: Provider;
  sdk: VoteAggregatorSdk;
  simulate: boolean;
  print: PrintFormat;
}

export let context: IContext | undefined;

export type PrintFormat = 'multisig' | 'legacy' | '0';

// For testing
export const setContext = ({
  provider,
  simulate = false,
  print,
}: {
  provider: Provider;
  simulate?: boolean;
  print?: string;
}) => {
  const sdk = new VoteAggregatorSdk(provider.connection);
  context = {
    provider,
    sdk,
    simulate,
    print: print as PrintFormat,
  };
};

export const setupContext = async ({
  config,
  cluster,
  wallet,
  commitment,
  skipPreflight,
  simulate = false,
  print,
}: {
  config?: string;
  cluster?: string;
  wallet?: string;
  commitment?: string;
  skipPreflight?: boolean;
  simulate?: boolean;
  print?: string;
}) => {
  if (context) {
    return; // For unit testing purpose
  }

  if (!cluster && !wallet && !commitment && !config) {
    config = '~/.config/solana/cli/config.yml';
  }

  if (config) {
    config = expandTilde(config);
    const configData: {
      json_rpc_url: string;
      // websocket_url: string;
      keypair_path: string;
      commitment: string;
    } = YAML.parse(await fs.readFile(config, 'utf-8'));
    if (!cluster) {
      cluster = configData.json_rpc_url;
    }
    if (!wallet) {
      wallet = configData.keypair_path;
    }
    if (!commitment) {
      commitment = configData.commitment;
    }
  } else {
    if (!cluster) {
      cluster = 'http://localhost:8899';
    }
    if (!wallet) {
      wallet = '~/.config/solana/id.json';
    }
  }

  if (cluster in ['devnet', 'testnet', 'mainnet-beta']) {
    cluster = clusterApiUrl(cluster as Cluster);
  }

  const connection = new Connection(cluster, {
    commitment: commitment as Commitment | undefined,
  });

  const walletKp = await parseKeypair(wallet);

  const provider = new AnchorProvider(connection, new Wallet(walletKp), {
    skipPreflight,
    commitment: commitment as Commitment | undefined,
  });

  const sdk = new VoteAggregatorSdk(connection);

  context = {
    provider,
    sdk,
    simulate,
    print: print as PrintFormat,
  };
};
