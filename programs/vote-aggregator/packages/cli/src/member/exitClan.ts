import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {getRealm} from '@solana/spl-governance';
import BN from 'bn.js';

export const installExitClanCLI = (program: Command) => {
  program
    .command('exit-clan')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .option('--owner <keypair>', 'Owner')
    .option('--clan <pubkey>', 'Clan')
    .action(exitClan);
};

const exitClan = async ({
  realm,
  side,
  owner,
  clan,
}: {
  realm: string;
  side: RealmSide;
  owner?: string;
  clan?: string;
}) => {
  const {sdk, provider} = context!;
  const ownerKp = owner ? await parseKeypair(owner) : null;
  const ownerAddress = ownerKp?.publicKey || provider.publicKey!;
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
  const [memberAddress] = sdk.member.memberAddress({
    rootAddress,
    owner: ownerAddress,
  });
  const memberData = await sdk.member.fetchMember({memberAddress});
  if (!memberData) {
    throw new Error(`Member ${memberAddress} does not exist`);
  }
  const currentTime = new BN(Math.floor(Date.now() / 1000));
  const clanAddress = clan
    ? await parsePubkey(clan)
    : memberData.membership.find(m => m.exitableAt?.lte(currentTime))?.clan;

  if (!clanAddress) {
    throw new Error('No clan for leaving found');
  }

  const signers = [];
  if (ownerKp) {
    signers.push(ownerKp);
  }
  await execute({
    instructions: [
      await sdk.member.exitClanInstruction({
        rootData,
        memberAddress,
        memberData,
        clan: clanAddress,
      }),
    ],
    signers,
  });
};
