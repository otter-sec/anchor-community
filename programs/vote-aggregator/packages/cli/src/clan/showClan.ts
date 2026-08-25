import {Command} from 'commander';
import {context} from '../context';
import {parsePubkey} from '../keyParser';
import {ClanAccount} from 'vote-aggregator-sdk';

export const installShowClanCLI = (program: Command) => {
  program
    .command('show-clan')
    .option('--address <pubkey>', 'Root address')
    .option('--root <pubkey>', 'Root address')
    .option('--owner <pubkey>', 'Owner address')
    .option('--delegate <pubkey>', 'Delegate address')
    .option('--voter-authority <pubkey>', 'Voter authority address')
    .option('--token-owner-record <pubkey>', 'Token owner record address')
    .option('--voter-weight-record <pubkey>', 'Voter weight record address')
    .action(showClan);
};

const clanToJson = (clan: ClanAccount) => {
  return {
    root: clan.root.toBase58(),
    owner: clan.owner.toBase58(),
    delegate: clan.delegate.toBase58(),
    voterAuthority: clan.voterAuthority.toBase58(),
    tokenOwnerRecord: clan.tokenOwnerRecord.toBase58(),
    voterWeightRecord: clan.voterWeightRecord.toBase58(),
    minVotingWeightToJoin: clan.minVotingWeightToJoin.toString(),
    permanentMembers: clan.permanentMembers.toString(),
    temporaryMembers: clan.temporaryMembers.toString(),
    updatedTemporaryMembers: clan.updatedTemporaryMembers.toString(),
    leavingMembers: clan.leavingMembers.toString(),
    permanentVoterWeight: clan.permanentVoterWeight.toString(),
    name: clan.name,
    description: clan.description,
  };
};

const showClan = async ({
  address,
  root,
  owner,
  delegate,
  voterAuthority,
  tokenOwnerRecord,
  voterWeightRecord,
}: {
  address?: string;
  root?: string;
  owner?: string;
  delegate?: string;
  voterAuthority?: string;
  tokenOwnerRecord?: string;
  voterWeightRecord?: string;
}) => {
  const {sdk} = context!;
  if (address) {
    const clanAddress = await parsePubkey(address);
    const clan = await sdk.clan.fetchClan(clanAddress);
    console.log(`Clan: ${clanAddress.toBase58()}`);
    console.log(JSON.stringify(clan, undefined, 2));
    return;
  }
  const rootAddress = (root && (await parsePubkey(root))) || undefined;
  const ownerAddress = (owner && (await parsePubkey(owner))) || undefined;
  const delegateAddress =
    (delegate && (await parsePubkey(delegate))) || undefined;
  const voterAuthorityAddress =
    (voterAuthority && (await parsePubkey(voterAuthority))) || undefined;
  const tokenOwnerRecordAddress =
    (tokenOwnerRecord && (await parsePubkey(tokenOwnerRecord))) || undefined;
  const voterWeightRecordAddress =
    (voterWeightRecord && (await parsePubkey(voterWeightRecord))) || undefined;
  const clans = await sdk.clan.fetchClans({
    root: rootAddress,
    owner: ownerAddress,
    delegate: delegateAddress,
    voterAuthority: voterAuthorityAddress,
    tokenOwnerRecord: tokenOwnerRecordAddress,
    voterWeightRecord: voterWeightRecordAddress,
  });

  for (const {publicKey, account} of clans) {
    console.log(`Clan: ${publicKey.toBase58()}`);
    console.log(JSON.stringify(clanToJson(account), undefined, 2));
  }
};
