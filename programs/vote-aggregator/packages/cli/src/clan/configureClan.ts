import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {PublicKey} from '@solana/web3.js';
import { BN } from 'bn.js';

export const installConfigureClanCLI = (program: Command) => {
  program
    .command('configure-clan')
    .requiredOption('--clan <pubkey>', 'Clan address')
    .option('--authority <keypair>', 'Owner')
    .option('--set-owner <pubkey>', 'New owner')
    .option('--set-name <string>', 'Name')
    .option('--set-description <string>', 'Description')
    .option('--set-delegate <pubkey>', 'Delegate')
    .option('--reset-delegate', 'Reset delegate')
    .option(
      '--set-min-voting-weight-to-join <number>',
      'Set min voting weight to j'
    )
    .option('--set-accept-temporary-members', 'Set accept temporary members')
    .option('--set-reject-temporary-members', 'Set accept temporary members')
    .action(configureClan);
};

const configureClan = async ({
  clan,
  authority,
  setOwner,
  setName,
  setDescription,
  setDelegate,
  resetDelegate,
  setMinVotingWeightToJoin,
  setAcceptTemporaryMembers,
  setRejectTemporaryMembers,
}: {
  clan: string;
  authority?: string;
  setOwner?: string;
  setName?: string;
  setDescription?: string;
  setDelegate?: string;
  resetDelegate?: boolean;
  setMinVotingWeightToJoin?: string;
  setAcceptTemporaryMembers?: boolean;
  setRejectTemporaryMembers?: boolean;
}) => {
  const {sdk, provider} = context!;

  const instructions = [];
  const signers = [];

  const clanAddress = await parsePubkey(clan);
  const authorityKp =
    authority !== undefined ? await parseKeypair(authority) : undefined;
  if (authorityKp) {
    signers.push(authorityKp);
  }
  const clanAuthority = authorityKp?.publicKey || provider.publicKey!;

  const clanData = await sdk.clan.fetchClan(clanAddress);

  if (setName || setDescription) {
    const name = setName ?? clanData.name;
    const description = setDescription ?? clanData.description;
    instructions.push(
      await sdk.clan.resizeClanInstruction({
        clanAddress,
        clanAuthority,
        size: 288 + name.length + description.length,
        payer: provider.publicKey!,
      })
    );

    if (setName) {
      instructions.push(
        await sdk.clan.setClanNameInstruction({
          clanAddress,
          clanAuthority,
          name: setName,
        })
      );
    }

    if (setDescription) {
      instructions.push(
        await sdk.clan.setClanDescriptionInstruction({
          clanAddress,
          clanAuthority,
          description: setDescription,
        })
      );
    }
  }

  if (setDelegate) {
    if (resetDelegate) {
      throw new Error('Can not set and reset delegate at the same time.');
    }
    const delegate = await parsePubkey(setDelegate);
    instructions.push(
      await sdk.clan.setClanDelegateInstruction({
        clanAddress,
        clanAuthority,
        delegate,
      })
    );
  } else if (resetDelegate) {
    instructions.push(
      await sdk.clan.setClanDelegateInstruction({
        clanAddress,
        clanAuthority,
        delegate: PublicKey.default,
      })
    );
  }

  if (setMinVotingWeightToJoin) {
    instructions.push(
      await sdk.clan.setClanMinVotingWeightToJoinInstruction({
        clanAddress,
        clanAuthority,
        minVotingWeightToJoin: new BN(setMinVotingWeightToJoin),
      })
    );
  }

  if (setAcceptTemporaryMembers) {
    if (setRejectTemporaryMembers) {
      throw new Error(
        'Can not set accept and reject temporary members at the same time.'
      );
    }
    instructions.push(
      await sdk.clan.setClanAcceptTemporaryMembersInstruction({
        clanAddress,
        clanAuthority,
        acceptTemporaryMembers: true,
      })
    );
  } else if (setRejectTemporaryMembers) {
    instructions.push(
      await sdk.clan.setClanAcceptTemporaryMembersInstruction({
        clanAddress,
        clanAuthority,
        acceptTemporaryMembers: false,
      })
    );
  }

  if (setOwner) {
    const newOwner = await parsePubkey(setOwner);
    instructions.push(
      await sdk.clan.setClanOwnerInstruction({
        clanAddress,
        owner: clanAuthority,
        newOwner,
      })
    );
  }

  await execute({instructions, signers});
};
