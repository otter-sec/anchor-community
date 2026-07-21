/*
import {Command} from 'commander';
import {context} from './context';
import {execute} from './execute';
import {parseKeypair, parsePubkey} from './keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {BN} from 'bn.js';

export const installDestroyAccountCLI = (program: Command) => {
  program
    .command('destroy-account')
    .option('--account <pubkey>', 'Account')
    .action(destroyAccount);
};

const destroyAccount = async ({account}: {account?: string}) => {
  const {sdk, provider} = context!;
  const accounts = [];
  if (account) {
    accounts.push(await parsePubkey(account));
  } else {
    for (const {pubkey} of await provider.connection.getProgramAccounts(
      sdk.programId
    )) {
      accounts.push(pubkey);
    }
  }

  await execute({
    instructions: await Promise.all(
      accounts.map(account =>
        sdk.program.methods
          .destroyAccount()
          .accountsStrict({
            account,
            rentCollector: provider.publicKey!,
          })
          .instruction()
      )
    ),
  });
};
*/
