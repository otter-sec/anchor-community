import {Commitment, PublicKey} from '@solana/web3.js';
import {BankrunProvider} from 'anchor-bankrun';
import {AddedAccount, startAnchor} from 'solana-bankrun';
import {setContext} from '../src/context';

export const startTest = async ({
  splGovernanceId,
  accounts = [],
}: {
  splGovernanceId: PublicKey;
  accounts?: AddedAccount[];
}) => {
  const testContext = await startAnchor(
    '../..',
    [
      {
        name: 'spl_governance',
        programId: splGovernanceId,
      },
    ],
    accounts
  );
  const provider = new BankrunProvider(testContext);
  // Fix the absence of the getLatestBlockhash in the bankrun proxy
  // actually used in the tx creation
  provider.connection.getLatestBlockhash = async (commitment?: Commitment) => {
    const [blockhash, lastValidBlockHeight] =
      (await testContext.banksClient.getLatestBlockhash(commitment))!;
    return Object.freeze({
      blockhash,
      lastValidBlockHeight: Number(lastValidBlockHeight),
    });
  };

  setContext({
    provider,
  });
  return {
    testContext,
    provider,
  };
};
