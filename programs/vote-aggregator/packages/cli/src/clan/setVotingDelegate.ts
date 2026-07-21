import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';

export const installSetVotingDelegateCLI = (program: Command) => {
  program
    .command('set-voting-delegate')
    .requiredOption('--clan <pubkey>', 'Clan address')
    .option('--authority <keypair>', 'Authority')
    .option('--new-voting-delegate <pubkey>', 'New voting delegate')
    .action(setVotingDelegate);
};

const setVotingDelegate = async ({
  clan,
  authority,
  newVotingDelegate,
}: {
  clan: string;
  authority?: string;
  newVotingDelegate?: string;
}) => {
  const {sdk, provider} = context!;
  const clanAddress = await parsePubkey(clan);
  const authorityKp = authority ? await parseKeypair(authority) : null;
  const newVotingDelegatePk = newVotingDelegate
    ? await parsePubkey(newVotingDelegate)
    : null;

  const signers = [];
  if (authorityKp) {
    signers.push(authorityKp);
  }

  const clanData = await sdk.clan.fetchClan(clanAddress);
  const root = await sdk.root.fetchRoot(clanData.root);

  await execute({
    instructions: [
      await sdk.clan.setVotingDelegateInstruction({
        rootAddress: clanData.root,
        rootData: root,
        clanAddress,
        clanAuthority: authorityKp
          ? authorityKp.publicKey
          : provider.publicKey!,
        newVotingDelegate: newVotingDelegatePk,
      }),
    ],
    signers,
  });
};
