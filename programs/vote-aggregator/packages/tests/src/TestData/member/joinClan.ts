import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {
  RealmTestData,
  MemberTestData,
  RootTestData,
  ClanTestData,
  buildKeypair,
  VoterWeightRecordTestData,
} from '../..';
import {BN} from '@coral-xyz/anchor';

export type JoinClanTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: MemberTestData;
  memberVoterWeight: VoterWeightRecordTestData;
  clan: ClanTestData;
  shareBp?: number;
  error?: string;
};

export const joinClanTestData: JoinClanTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        'B4weSxQ3gTqUK3DtH4MaRdd7CCpa9Ncb7kPcNtEJXn7P'
      ),
      realmAddress: new PublicKey(
        '5ABXgPnaXC4D8LpYfNaC21cYeyxASTfJEAPK3zXyi2i7'
      ),
      communityMint: new PublicKey(
        '6vMnTXmDwxPAAi9qqhKxmvBkdjT6ug1iH1Yu6AEq4K2Y'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(32),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '2LXp6ZzhWDiCGJpLq5Tawyd91fNv3GMHVBs8aXSR7ZGY'
      ),
    },
    root: {
      side: 'community',
      votingWeightPlugin: new PublicKey(
        '7rviyXF8Jw4RTctLE3R73KbEc5UdppKZLNbgfPBRMfkx'
      ),
    },
    member: {
      owner: buildKeypair(
        '7RLeU6Hv1Wzd6GpYiVcm4FgH9DQpJxAeGpWhWgmBtrZu',
        [
          39, 141, 50, 186, 243, 210, 38, 21, 161, 248, 113, 86, 208, 130, 179,
          231, 28, 250, 153, 77, 175, 133, 82, 233, 227, 56, 190, 3, 16, 152,
          170, 230, 95, 98, 70, 86, 191, 250, 88, 114, 183, 159, 10, 197, 17,
          193, 77, 176, 164, 36, 247, 10, 55, 136, 172, 62, 43, 241, 160, 234,
          245, 6, 29, 176,
        ]
      ),
    },
    memberVoterWeight: {
      address: new PublicKey('FWFMJ1qeKUBqk9Mnuigf6Ln3PaPuBD69FLxZeB66YoCP'),
      voterWeight: new BN(2 * LAMPORTS_PER_SOL),
      plugin: new PublicKey('7rviyXF8Jw4RTctLE3R73KbEc5UdppKZLNbgfPBRMfkx'),
    },
    clan: {
      address: new PublicKey('DWCHP6gPZeE7mggkrFtbrcNjn7NhKSrwwhanrFJBecvZ'),
      owner: new PublicKey('75FiaNGSsELGGC3No2Tt2JnXHQrpaQzYLua4bjJJ44DW'),
      name: 'Marinade',
    },
  },
];
