import {Command} from 'commander';

import {installCreateClanCLI} from './createClan';
import {installSetVotingDelegateCLI} from './setVotingDelegate';
import {installShowClanCLI} from './showClan';
import {installConfigureClanCLI} from './configureClan';
import {installForcedCancelProposalCLI} from './forcedCancelProposal';
import {installUpdateProposalVoteCLI} from './updateProposalVote';

export const installClanCommands = (program: Command) => {
  installCreateClanCLI(program);
  installConfigureClanCLI(program);
  installSetVotingDelegateCLI(program);
  installShowClanCLI(program);
  installForcedCancelProposalCLI(program);
  installUpdateProposalVoteCLI(program);
};
