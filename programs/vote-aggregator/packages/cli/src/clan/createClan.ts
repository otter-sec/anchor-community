import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey, parsePubkeyOrKeypair} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {getRealm} from '@solana/spl-governance';
import {Keypair} from '@solana/web3.js';

export const installCreateClanCLI = (program: Command) => {
  program
    .command('create-clan')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .option('--clan <keypair>', 'Clan address')
    .option('--owner <pubkey|keypair>', 'Owner')
    .option('--name <string>', 'Name')
    .option('--description <string>', 'Description')
    .action(createClan);
};

const createClan = async ({
  realm,
  side,
  clan,
  owner,
  name,
  description,
}: {
  realm: string;
  side: RealmSide;
  clan?: string;
  owner: string;
  name: string;
  description: string;
}) => {
  const {sdk, provider} = context!;

  const instructions = [];
  const signers = [];

  const clanAddress = clan ? await parseKeypair(clan) : Keypair.generate();
  const ownerPkOrKp = owner && (await parsePubkeyOrKeypair(owner));
  const ownerPk =
    ownerPkOrKp instanceof Keypair
      ? ownerPkOrKp.publicKey
      : ownerPkOrKp || provider.publicKey!;
  const onwerKp = ownerPkOrKp instanceof Keypair ? ownerPkOrKp : undefined;
  const temporalOwner =
    (name || description) && !onwerKp ? provider.publicKey! : ownerPk;

  const realmAddress = await parsePubkey(realm);
  const realmData = await getRealm(provider.connection, realmAddress);
  const governingTokenMint =
    side === 'community'
      ? realmData.account.communityMint
      : realmData.account.config.councilMint!;
  const [rootAddress] = sdk.root.rootAddress({
    realmAddress,
    governingTokenMint,
  });
  const rootData = await sdk.root.fetchRoot(rootAddress);
  console.log(`Creating clan ${clanAddress.publicKey.toBase58()}`);
  instructions.push(
    await sdk.clan.createClanInstruction({
      rootAddress,
      rootData,
      clanAddress: clanAddress.publicKey,
      owner: temporalOwner,
      payer: provider.publicKey!,
    })
  );
  signers.push(clanAddress);

  if (name || description) {
    if (onwerKp) {
      signers.push(onwerKp);
    }

    instructions.push(
      await sdk.clan.resizeClanInstruction({
        clanAddress: clanAddress.publicKey,
        clanAuthority: temporalOwner,
        payer: provider.publicKey!,
        size: 288 + name.length + description.length,
      })
    );

    if (name) {
      instructions.push(
        await sdk.clan.setClanNameInstruction({
          clanAddress: clanAddress.publicKey,
          clanAuthority: temporalOwner,
          name,
        })
      );
    }

    if (description) {
      instructions.push(
        await sdk.clan.setClanDescriptionInstruction({
          clanAddress: clanAddress.publicKey,
          clanAuthority: temporalOwner,
          description,
        })
      );
    }

    if (!temporalOwner.equals(ownerPk)) {
      instructions.push(
        await sdk.clan.setClanOwnerInstruction({
          clanAddress: clanAddress.publicKey,
          owner: temporalOwner,
          newOwner: ownerPk,
        })
      );
    }
  }

  await execute({
    instructions,
    signers,
  });
};
