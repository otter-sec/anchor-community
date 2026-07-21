import {PublicKey} from '@solana/web3.js';
import {RealmTestData, MemberTestData, RootTestData, buildKeypair} from '../..';
import {BN} from '@coral-xyz/anchor';

export type StartLeavingClanTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: MemberTestData;
  clanIndex?: number;
  error?: string;
};

export const startLeavingClanTestData: StartLeavingClanTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        'FwKrXDgQsPASuWCMrCrNBCYYgehJ2c5sii2qA3VpSeKW'
      ),
      realmAddress: new PublicKey(
        'H2UXDrtrxBjNiub2dz4yPyumdzho2EYvUbvDaoU3BW65'
      ),
      communityMint: new PublicKey(
        '8qteAhUsfpV7pKAZgPLp4iWtBLD4WSMPBbChmoMwVzcL'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'CZhxpBMQ7vnre3E7AgQACxnPeqBz5LknJZ4xu6x5wdmf'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
    },
    member: {
      owner: buildKeypair(
        '8P6pvbVLaj6e7R5bX8MJoeyKLCnkdSBjCp4yvYhWnXbM',
        [
          52, 2, 70, 104, 125, 196, 141, 233, 193, 241, 20, 198, 52, 226, 157,
          105, 123, 252, 17, 247, 254, 131, 119, 83, 97, 72, 113, 211, 85, 31,
          9, 133, 109, 171, 44, 144, 64, 175, 164, 158, 20, 234, 57, 9, 235,
          227, 35, 178, 28, 226, 130, 254, 75, 49, 206, 215, 101, 198, 231, 17,
          186, 156, 15, 24,
        ]
      ),
      voterWeight: new BN('6829473823'),
      membership: [
        {
          clan: {
            address: new PublicKey(
              '4G4wcigQWN98PhYePHWdwHtoBEGmhQytoRfJwgeQYY8E'
            ),
            owner: new PublicKey(
              '7MNfY1GZxC5GU7GMncKcyGWUS7roFw42aW1ARxvW9Esz'
            ),
            name: 'Marinade',
            permanentMembers: new BN(2),
            voterWeight: new BN('845094346777'),
            permanentVoterWeight: new BN('845094346777'),
          },
          shareBp: 10000,
        },
      ],
    },
  },
];
