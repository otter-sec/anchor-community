import {Program, Provider} from '@coral-xyz/anchor';
import {Cluster, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {VoterStakeRegistry, IDL} from '../voter_stake_registry';
import {IdlAccounts} from '@coral-xyz/anchor';

export type RegistrarAccount = IdlAccounts<VoterStakeRegistry>['registrar'];
export type VoterAccount = IdlAccounts<VoterStakeRegistry>['voter'];

const sdkCache = new Map<
  Cluster,
  Map<PublicKey, Program<VoterStakeRegistry>>
>();

class ReadonlyProvider implements Provider {
  constructor(public connection: Connection) {}
}

const vsrSdk = ({
  network,
  vsrProgram,
}: {
  network: Cluster;
  vsrProgram: PublicKey;
}) => {
  if (!sdkCache.has(network)) {
    sdkCache.set(network, new Map<PublicKey, Program<VoterStakeRegistry>>());
  }

  const networkCache = sdkCache.get(network)!;
  if (!networkCache.has(vsrProgram)) {
    const connection = new Connection(clusterApiUrl(network), {
      commitment: 'confirmed',
    });
    networkCache.set(
      vsrProgram,
      new Program(IDL, vsrProgram, new ReadonlyProvider(connection))
    );
  }
  return networkCache.get(vsrProgram)!;
};

export default vsrSdk;
