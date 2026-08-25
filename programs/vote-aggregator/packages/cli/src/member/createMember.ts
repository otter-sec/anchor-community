import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {getRealm} from '@solana/spl-governance';

export const installCreateMemberCLI = (program: Command) => {
  program
    .command('create-member')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .option('--owner <keypair>', 'Owner')
    .action(createMember);
};

const createMember = async ({
  realm,
  side,
  owner,
}: {
  realm: string;
  side: RealmSide;
  owner?: string;
}) => {
  const {sdk, provider} = context!;
  const ownerKp = owner ? await parseKeypair(owner) : null;
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

  const signers = [];
  if (ownerKp) {
    signers.push(ownerKp);
  }
  await execute({
    instructions: [
      await sdk.member.createMemberInstruction({
        rootAddress,
        rootData: {
          governanceProgram: realmData.owner,
          realm: realmAddress,
          governingTokenMint,
        },
        owner: ownerKp?.publicKey || provider.publicKey!,
        payer: provider.publicKey!,
      }),
    ],
    signers,
  });
};
