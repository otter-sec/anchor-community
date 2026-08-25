import {Command} from 'commander';

import {installCreateRealmCLI} from './createRealm';
import { installCreateProposalCLI } from './createProposal';
import { installCastVoteCLI } from './castVote';
import { installExecuteProposalCLI } from './executeProposal';

export const installRealmCommands = (program: Command) => {
  installCreateRealmCLI(program);
  installCreateProposalCLI(program);
  installCastVoteCLI(program);
  installExecuteProposalCLI(program);
};
