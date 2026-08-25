import {Keypair, PublicKey} from '@solana/web3.js';
import {buildKeypair} from '../..';
import {RealmTestData} from '../../SplGovernance/realm';
import {BN} from '@coral-xyz/anchor';
import {RootTestData} from '../../VoteAggregator/root';

export type CreateMemberTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: {
    owner: Keypair;
  };
  error?: string;
};

export const createMemberTestData: CreateMemberTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        'HS35DYHnQANTJ8YFWG2VWKm8BhPaqU7a9yqb5sg3fqHp'
      ),
      realmAddress: new PublicKey(
        '5Yz3nQV5NatQNXeVxzNGzMWjdtvPnjNJd1bSvCMrFGJ7'
      ),
      communityMint: new PublicKey(
        'ANBM4Yn2ks2W6KdCtuf112DmqG6NtoURH36qGBK9Jf7e'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(32),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '77hvR5P1R6MKNrtrz9qBMiweZPofxPzkA7tqXNEu5PWC'
      ),
    },
    root: {
      side: 'community',
    },
    member: {
      owner: buildKeypair(
        '5Gf1EKXxQdkJ6Eqjk65NwouTbLwBEjZy88fUoG3Twjb7',
        [
          212, 225, 128, 152, 4, 43, 42, 18, 144, 158, 191, 118, 35, 229, 204,
          119, 139, 222, 140, 120, 130, 1, 180, 231, 175, 83, 143, 95, 158, 108,
          144, 112, 63, 113, 110, 89, 166, 165, 246, 108, 159, 182, 9, 71, 19,
          207, 22, 142, 175, 28, 31, 123, 183, 103, 174, 37, 210, 169, 104, 99,
          139, 22, 254, 178,
        ]
      ),
    },
  },
];
