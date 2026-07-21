import {Command} from 'commander';
import {context} from '../context';
import {PublicKey} from '@solana/web3.js';
import {parsePubkey} from '../keyParser';
import {RootAccount} from 'vote-aggregator-sdk';

export const installShowRootCLI = (program: Command) => {
  program
    .command('show-root')
    .option('--address <pubkey>', 'Root address')
    .option('--governance-program <pubkey>', 'Governance program id')
    .option('--realm <pubkey>', 'Realm address')
    .option('--governing-token-mint <pubkey>', 'Governing token mint')
    .option('--voting-weight-plugin <pubkey>', 'Voting weight plugin')
    .action(showRoot);
};

const rootToJson = (root: RootAccount) => {
  return {
    governanceProgram: root.governanceProgram.toBase58(),
    realm: root.realm.toBase58(),
    governingTokenMint: root.governingTokenMint.toBase58(),
    votingWeightPlugin: root.votingWeightPlugin.toBase58(),
    maxProposalLifetime: root.maxProposalLifetime.toString(),
    clanCount: root.clanCount.toString(),
    memberCount: root.memberCount.toString(),
  };
};

const showRoot = async ({
  address,
  governanceProgram,
  realm,
  governingTokenMint,
  votingWeightPlugin,
}: {
  address?: string;
  governanceProgram?: string;
  realm?: string;
  governingTokenMint?: string;
  votingWeightPlugin?: string;
}) => {
  const {sdk} = context!;
  let rootAddress: PublicKey | undefined;
  if (address) {
    rootAddress = await parsePubkey(address);
  }
  if (!rootAddress && realm && governingTokenMint) {
    [rootAddress] = sdk.root.rootAddress({
      realmAddress: await parsePubkey(realm!),
      governingTokenMint: await parsePubkey(governingTokenMint!),
    });
  }
  if (rootAddress) {
    const root = await sdk.root.fetchRoot(rootAddress);
    console.log(`Root: ${rootAddress.toBase58()}`);
    console.log(JSON.stringify(rootToJson(root), undefined, 2));
    return;
  }
  const governanceProgramId =
    (governanceProgram && (await parsePubkey(governanceProgram))) || undefined;
  const realmId = (realm && (await parsePubkey(realm))) || undefined;
  const governingTokenMintId =
    (governingTokenMint && (await parsePubkey(governingTokenMint))) ||
    undefined;
  const votingWeightPluginId =
    (votingWeightPlugin && (await parsePubkey(votingWeightPlugin))) ||
    undefined;
  const roots = await sdk.root.fetchRoots({
    governanceProgram: governanceProgramId,
    realm: realmId,
    governingTokenMint: governingTokenMintId,
    votingWeightPlugin: votingWeightPluginId,
  });
  for (const {publicKey, account} of roots) {
    console.log(`Root: ${publicKey.toBase58()}`);
    console.log(JSON.stringify(rootToJson(account), undefined, 2));
  }
};
