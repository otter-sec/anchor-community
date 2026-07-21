import {Command} from 'commander';
import {context} from '../context';
import {execute} from '../execute';
import {parseKeypair, parsePubkey} from '../keyParser';
import {PublicKey} from '@solana/web3.js';
import {MembershipEntry} from 'vote-aggregator-sdk';

export const installJoinClanCLI = (program: Command) => {
  program
    .command('join-clan')
    .option('--owner <keypair>', 'Owner')
    .requiredOption('--clan <pubkey>', 'Clan')
    .option('--member-voter-weight <pubkey>', 'Member voter weight')
    .option('--share', 'Share basis points')
    .action(joinClan);
};

const joinClan = async ({
  owner,
  clan,
  memberVoterWeight,
  share,
}: {
  owner?: string;
  clan: string;
  memberVoterWeight?: string;
  share?: string;
}) => {
  const {sdk, provider} = context!;
  const ownerKp = owner ? await parseKeypair(owner) : null;
  const ownerAddress = ownerKp?.publicKey || provider.publicKey!;
  const clanAddress = await parsePubkey(clan);
  const clanData = await sdk.clan.fetchClan(clanAddress);
  const rootData = await sdk.root.fetchRoot(clanData.root);

  let memberVwr: PublicKey;
  if (memberVoterWeight) {
    memberVwr = await parsePubkey(memberVoterWeight);
  } else {
    memberVwr = (
      await sdk.member.findVoterWeightRecord({
        rootData,
        owner: ownerAddress,
      })
    ).pubkey;
  }

  const instructions = [];

  const [memberAddress] = sdk.member.memberAddress({
    rootAddress: clanData.root,
    owner: ownerAddress,
  });
  let memberData: {
    root: PublicKey;
    owner: PublicKey;
    tokenOwnerRecord?: PublicKey;
    membership: MembershipEntry[];
  } | null = await sdk.member.fetchMember({memberAddress});
  if (!memberData) {
    instructions.push(
      await sdk.member.createMemberInstruction({
        rootAddress: clanData.root,
        rootData,
        owner: ownerAddress,
        payer: provider.publicKey!,
      })
    );
    memberData = {
      root: clanData.root,
      owner: ownerAddress,
      membership: [],
    };
  }

  let shareBp = 10000;
  if (share) {
    shareBp = parseInt(share);
  } else {
    for (const m of memberData.membership) {
      shareBp -= m.shareBp;
    }
  }
  if (shareBp <= 0) {
    throw new Error('No share left');
  }

  const signers = [];
  if (ownerKp) {
    signers.push(ownerKp);
  }
  instructions.push(
    await sdk.member.joinClanInstruction({
      rootData,
      memberAddress,
      memberData,
      clanAddress,
      memberVwr,
      shareBp,
      payer: provider.publicKey!,
    })
  );
  await execute({
    instructions,
    signers,
  });
};
