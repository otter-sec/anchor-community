import {Command} from 'commander';
import {setupContext} from './context';
import {installRootCommands} from './root';
import {installClanCommands} from './clan';
import {installMemberCommands} from './member';
import { installRealmCommands } from './realms';
// import {installDestroyAccountCLI} from './destroyAccount';

export const cli = () => {
  const program = new Command();

  program
    .version('0.0.1')
    .allowExcessArguments(false)
    .option('--config <string>', 'Config')
    .option('--cluster <string>', 'Cluster name or endpoint address')
    .option('--wallet <string>', 'Path to the signer keypair')
    .option('--commitment <string>', 'Commitment level')
    .option('--skip-preflight', 'Skip preflight')
    .option('--simulate', 'Run simulation first')
    .option('--print <multisig|legacy|0>', 'Print tx instead of running')
    .hook('preAction', (command: Command) => setupContext(command.opts()));

  installRootCommands(program);
  installClanCommands(program);
  installMemberCommands(program);
  // installDestroyAccountCLI(program);
  installRealmCommands(program);

  return program;
};
