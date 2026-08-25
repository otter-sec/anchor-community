import {PublicKey} from '@solana/web3.js';
import {buildKeypair} from '../..';
import {RealmTestData} from '../../SplGovernance/realm';
import {BN} from '@coral-xyz/anchor';

export type CreateRootTestData = {
  realm: RealmTestData;
  maxProposalLifetime?: BN;
  error?: string;
};

export const createRootTestData: CreateRootTestData[] = [
  // Community side, no plugins
  {
    realm: {
      splGovernanceId: new PublicKey(
        'GovErnqK4XvMPN1Njxh1zTQpzzzPZUaJQGjHM9qHjMHr'
      ),
      realmAddress: new PublicKey(
        'BvQys4bSSzv8HnTUse17x6sm67qbQ5u7xj2BiCkQZc4d'
      ),
      communityMint: new PublicKey(
        '7dz49JkGFr9ywHJJyT7xJkWFJv1HSw6a1oKQMRsjTuci'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(50),
      },
      minCommunityWeightToCreateGovernance: new BN(1),
      authority: buildKeypair(
        'ALkNx6FUt5DeTXEgmsMtpF6HjBu5v9YA5tHHU1oFB8Mx',
        [
          207, 38, 98, 199, 150, 51, 211, 40, 243, 30, 46, 193, 102, 17, 11, 18,
          254, 208, 250, 42, 212, 240, 136, 55, 111, 57, 238, 82, 10, 86, 103,
          14, 138, 200, 68, 16, 85, 148, 62, 51, 52, 232, 207, 157, 125, 113,
          181, 14, 181, 26, 174, 197, 83, 27, 235, 159, 130, 54, 243, 41, 208,
          237, 167, 107,
        ]
      ),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '4kyj9uA9BCSR7pf4b6hP9ByTVLNuKkxj3vPdULVoDW5t'
      ),
    },
  },
  // Community side with plugins
  {
    realm: {
      splGovernanceId: new PublicKey(
        'govrnqX1Kx5j1Y3Y3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3'
      ),
      realmAddress: new PublicKey(
        'HaP8jMNA5tyyZo4WUybWzw2JDm26ks1tM8hzdtFgQ9j4'
      ),
      communityMint: new PublicKey(
        'FFoZHtEnVAcqWRrWSJuSwaNhDD233ji8AUsUGdTMqf7n'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(20),
      },
      minCommunityWeightToCreateGovernance: new BN(2),
      authority: buildKeypair(
        'FRBUNsdJmHmuZ3STCHENKNozW1mUot5kQmvcNg4yaMDd',
        [
          52, 150, 62, 72, 210, 82, 150, 77, 67, 123, 83, 220, 233, 40, 252,
          240, 63, 179, 19, 22, 172, 92, 171, 167, 138, 115, 247, 222, 39, 201,
          75, 25, 214, 53, 101, 170, 191, 239, 19, 250, 246, 196, 209, 225, 104,
          136, 77, 20, 223, 240, 54, 16, 20, 73, 216, 168, 142, 114, 4, 123, 95,
          113, 146, 116,
        ]
      ),
      name: 'Community side with plugins',
      communityMintAuthority: new PublicKey(
        '9Uk3YgUCo8YyTyVENXTiiH1wV1fkpTYDzHitRifwAwA'
      ),
      communityTokenConfig: {
        voterWeightAddin: new PublicKey(
          'CSzMGQjWBtM6tfFGnAe4jSn62qDZjL94uHDvMXNAFka6'
        ),
        maxVoterWeightAddin: new PublicKey(
          'CAtStpbXBSmrd3oBwS7ePgMZJ7KK79UVpmM87aGnzpgc'
        ),
      },
    },
  },
  // Community + council side, no plugins
  {
    realm: {
      splGovernanceId: new PublicKey(
        'GrR56FFSgyyMMJtNVsS33nvoM8zXGdHs69QfvZhALv8C'
      ),
      realmAddress: new PublicKey(
        'BgdaaVW8xi3stnmSQxDgbUSrKETHehgKdZnDLf25nqoc'
      ),
      communityMint: new PublicKey(
        '2XjVUAVYD6fUnUBoJqLNbQjufdQft4PtxcQwLMkuQrpM'
      ),
      councilMint: new PublicKey(
        '25fzgPBoXMgds3XmZLq1ECVF4HNoBd7RAh9nBoScEdpp'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(50),
      },
      minCommunityWeightToCreateGovernance: new BN(100),
      authority: buildKeypair(
        'GDSEdbzQWVC61j4YhVQZ5pkhQSJ9eg1Gtarj3f3xkga2',
        [
          81, 204, 215, 122, 129, 165, 51, 68, 231, 153, 19, 108, 90, 145, 190,
          166, 19, 67, 169, 207, 172, 137, 79, 235, 214, 234, 19, 85, 253, 217,
          22, 174, 226, 14, 206, 147, 6, 81, 62, 124, 135, 247, 93, 74, 151,
          240, 22, 157, 82, 251, 177, 66, 119, 0, 192, 196, 242, 102, 139, 72,
          245, 219, 184, 223,
        ]
      ),
      name: 'Community + council side, no plugins',
      communityMintAuthority: new PublicKey(
        'HDNyLfMPBA1wftuyehVHjvRdfNgCAVpcsYFQFZXV6Jhn'
      ),
      councilMintAuthority: new PublicKey(
        '7ijbDRVMS72rYC91ioxzAXfW11JKyAXhqpY6RFg4Ezon'
      ),
    },
  },

  // Community + council side with plugins
  {
    realm: {
      splGovernanceId: new PublicKey(
        'C33AVZsSSswAx6gqi3KXT7bxpXPPi5n1KSFZoan7Zh2m'
      ),
      realmAddress: new PublicKey(
        '9a5LFeRuT5mSvFw5pNQFCaXLJb4HE83JBxY9s2BnAiiZ'
      ),
      communityMint: new PublicKey(
        'B4wVHPFEBvhsMxsrEYX2cVbTfcfQiLZMh7XbofeDofhd'
      ),
      councilMint: new PublicKey(
        'EpdNSa67fpomhxXSKaL5fwaCPQGYbWVPf7k6NvpJZnCd'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(90),
      },
      minCommunityWeightToCreateGovernance: new BN(3),
      authority: buildKeypair(
        'JDt2fQ5TSEn5LBEueZwmpnTUeG3aCebtHDz75paZSw8k',
        [
          184, 242, 81, 232, 89, 137, 27, 71, 105, 48, 158, 18, 156, 30, 252,
          44, 147, 67, 82, 156, 62, 140, 240, 147, 144, 17, 250, 174, 242, 209,
          255, 80, 255, 227, 88, 130, 138, 9, 7, 245, 142, 25, 6, 32, 226, 243,
          47, 86, 184, 50, 114, 218, 177, 180, 172, 183, 46, 116, 43, 108, 47,
          12, 192, 161,
        ]
      ),
      name: 'Community + council side with plugins',
      communityMintAuthority: new PublicKey(
        '3ZRoXtmfkVwb3h9kMsmcs9gJYYcdEVh7W4bsLUFwLepG'
      ),
      councilMintAuthority: new PublicKey(
        'GgdDGQsoEoYYsfs8iB4F2EZRoNumq2xzvHrGUsVUQzb7'
      ),
      communityTokenConfig: {
        voterWeightAddin: new PublicKey(
          'Cgkum2oTs87Vhtu87Y8UznPB5tvNSdBweEGQsxYhzeLN'
        ),
        maxVoterWeightAddin: new PublicKey(
          '3cWyirr8k5NK1ZX8A4ZUpsg1TpHnf2HXvJyBH6BWodHF'
        ),
      },
      councilTokenConfig: {
        voterWeightAddin: new PublicKey(
          'AiurCiekwEz3i8gVapCdRWs9fb4ry45RHCD691AUp5sd'
        ),
        maxVoterWeightAddin: new PublicKey(
          'AEjwvocgFfu2hpGZpY2qGaEzoCQrGYnf7TGSviEZB9Fn'
        ),
      },
    },
  },
];
