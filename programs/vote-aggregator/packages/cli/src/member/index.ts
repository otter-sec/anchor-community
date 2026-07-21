import {Command} from 'commander';

import {installCreateMemberCLI} from './createMember';
import {installJoinClanCLI} from './joinClain';
import {installStartLeavingClanCLI} from './startLeavingClan';
import {installExitClanCLI} from './exitClan';
import {installUpdateVoterWeightCLI} from './updateVoterWeight';
import {installSetVoterWeightRecordCLI} from './setVoterWeightRecord';

export const installMemberCommands = (program: Command) => {
  installCreateMemberCLI(program);
  installJoinClanCLI(program);
  installStartLeavingClanCLI(program);
  installExitClanCLI(program);
  installUpdateVoterWeightCLI(program);
  installSetVoterWeightRecordCLI(program);
};
