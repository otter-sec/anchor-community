import {Cluster, PublicKey} from '@solana/web3.js';
import vsrSdk, {RegistrarAccount, VoterAccount} from './vsrSdk';
import BN from 'bn.js';
import {getAssociatedTokenAddressSync} from '@solana/spl-token';

export type TokenStatus = {
  mint: PublicKey;
  balance: BN;
  configIndex: number;
  depositIndex?: number;
};

export type VsrVoterInfo = {
  voter: VoterAccount | null;
  tokenStatuses: TokenStatus[];
};

const fetchVsrVoter = async ({
  network,
  rootData,
  owner,
}: {
  network: Cluster;
  rootData: {
    realm: PublicKey;
    governingTokenMint: PublicKey;
    votingWeightPlugin: PublicKey;
    registrar: RegistrarAccount;
  };
  owner: PublicKey;
}) => {
  const vsr = vsrSdk({network, vsrProgram: rootData.votingWeightPlugin});
  const [registrarAddress] = PublicKey.findProgramAddressSync(
    [
      rootData.realm.toBuffer(),
      Buffer.from('registrar', 'utf-8'),
      rootData.governingTokenMint.toBuffer(),
    ],
    rootData.votingWeightPlugin
  );
  const [voterAddress] = PublicKey.findProgramAddressSync(
    [
      registrarAddress.toBuffer(),
      Buffer.from('voter', 'utf-8'),
      owner.toBuffer(),
    ],
    rootData.votingWeightPlugin
  );
  const voterData = await vsr.account.voter.fetchNullable(voterAddress);

  const tokenStatuses: TokenStatus[] = [];
  for (
    let configIndex = 0;
    configIndex < rootData.registrar.votingMints.length;
    configIndex++
  ) {
    const mintEntry = rootData.registrar.votingMints[configIndex];
    if (mintEntry.mint.equals(PublicKey.default)) {
      continue;
    }
    if (!tokenStatuses.find(t => t.mint.equals(mintEntry.mint))) {
      let depositIndex: number | undefined;
      if (voterData) {
        for (let i = 0; i < voterData.deposits.length; i++) {
          if (
            voterData.deposits[i].isUsed &&
            voterData.deposits[i].votingMintConfigIdx === configIndex
          ) {
            depositIndex = i;
            break;
          }
        }
      }
      let balance = new BN(0);
      try {
        balance = new BN(
          (
            await vsr.provider.connection.getTokenAccountBalance(
              getAssociatedTokenAddressSync(mintEntry.mint, owner)
            )
          ).value.amount
        );
      } catch (e) {
        if (
          !((e as Error).message as string).endsWith('could not find account')
        ) {
          throw e;
        }
      }
      tokenStatuses.push({
        mint: mintEntry.mint,
        balance,
        configIndex,
        depositIndex,
      });
    }
  }

  return {
    voter: voterData,
    tokenStatuses,
  };
};

export default fetchVsrVoter;
