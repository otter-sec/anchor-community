import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {getRealm} from '@solana/spl-governance';

export const installUpdateVoterWeightCLI = (program: Command) => {
  program
    .command('update-voter-weight')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .option('--owner <pubkey>', 'Owner')
    .action(updateVoterWeight);
};

const updateVoterWeight = async ({
  realm,
  side,
  owner,
}: {
  realm: string;
  side: RealmSide;
  owner?: string;
}) => {
  const {sdk, provider} = context!;
  const ownerAddress = owner ? await parsePubkey(owner) : provider.publicKey!;
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
  const memberAddress = sdk.member.memberAddress({
    rootAddress,
    owner: ownerAddress,
  })[0];
  const memberData = await sdk.member.fetchMember({memberAddress});
  if (!memberData) {
    throw new Error(`Member ${memberAddress} does not exist`);
  }

  await execute({
    instructions: [
      await sdk.member.updateVoterWeightInstruction({
        memberAddress,
        memberData,
      }),
    ],
  });
};
