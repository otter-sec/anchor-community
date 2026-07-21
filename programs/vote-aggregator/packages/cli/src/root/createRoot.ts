import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {BN} from 'bn.js';

export const installCreateRootCLI = (program: Command) => {
  program
    .command('create-root')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .option('--realm-authority <keypair>', 'Realm authority')
    .option('--max-proposal-lifetime <number>', 'Max proposal lifetime')
    .action(createRoot);
};

const createRoot = async ({
  realm,
  side,
  realmAuthority,
  maxProposalLifetime,
}: {
  realm: string;
  side: RealmSide;
  realmAuthority?: string;
  maxProposalLifetime?: string;
}) => {
  const {sdk, provider} = context!;
  const signers = [];
  if (realmAuthority) {
    signers.push(await parseKeypair(realmAuthority));
  }
  await execute({
    instructions: await sdk.root.createRootInstructions({
      realmAddress: await parsePubkey(realm),
      side,
      maxProposalLifetime:
        (maxProposalLifetime && new BN(maxProposalLifetime)) || undefined,
      payer: provider.publicKey!,
    }),
    signers,
  });
};
