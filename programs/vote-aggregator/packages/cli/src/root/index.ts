import {Command} from 'commander';

import {installCreateRootCLI} from './createRoot';
import {installConfigureRootCLI} from './configureRoot';
import {installShowRootCLI} from './showRoot';

export const installRootCommands = (program: Command) => {
  installCreateRootCLI(program);
  installConfigureRootCLI(program);
  installShowRootCLI(program);
};
