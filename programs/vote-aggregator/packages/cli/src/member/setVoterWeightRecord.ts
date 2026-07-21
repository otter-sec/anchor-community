import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {RealmSide} from 'vote-aggregator-sdk';
import {getRealm} from '@solana/spl-governance';

export const installSetVoterWeightRecordCLI = (program: Command) => {
  program
    .command('set-voter-weight-record')
    .requiredOption('--realm <pubkey>', 'Realm address')
    .option('--side <string>', 'Side', 'community')
    .requiredOption('--vwr <pubkey>', 'Voter Weight Record address')
    .option('--owner <keypair>', 'Owner')
    .action(setVoterWeightRecord);
};

const setVoterWeightRecord = async ({
  realm,
  side,
  vwr,
  owner,
}: {
  realm: string;
  side: RealmSide;
  vwr: string;
  owner?: string;
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
  const memberAddress = sdk.member.memberAddress({
    rootAddress,
    owner: ownerAddress,
  })[0];
  const memberData = await sdk.member.fetchMember({memberAddress});
  if (!memberData) {
    throw new Error(`Member ${memberAddress} does not exist`);
  }
  const memberVwr = await parsePubkey(vwr);

  const signers = [];
  if (ownerKp) {
    signers.push(ownerKp);
  }
  await execute({
    instructions: [
      await sdk.member.setVoterWeightRecordInstruction({
        memberAddress,
        memberData,
        memberVwr,
      }),
    ],
    signers,
  });
};
