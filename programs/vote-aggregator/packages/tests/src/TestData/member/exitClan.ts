import {PublicKey} from '@solana/web3.js';
import {RealmTestData, MemberTestData, RootTestData, buildKeypair} from '../..';
import {BN} from '@coral-xyz/anchor';

export type ExitClanTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: MemberTestData;
  clanIndex?: number;
  clanLeavingTimeOffset?: BN;
  error?: string;
};

export const exitClanTestData: ExitClanTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '5zGp3YAiWdPUBVinF3oWhMnZ5cFCenfGUdL7aWwBDjx9'
      ),
      realmAddress: new PublicKey(
        'CWJWtfw2mtGyUe7HDY3Y4uVzZj4ziWsVgCHosLtQRjjf'
      ),
      communityMint: new PublicKey(
        '2RQQcsA7s5XwYNPJZjxqGTbxxcGznshpZzaSZJfh77Mv'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(23),
      },
      minCommunityWeightToCreateGovernance: new BN(8),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'E476Ri5qfAyzDB3wHiFv7q7CKePymJZqBUhyCTyVUXFh'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: buildKeypair(
        '2JhhaS9cxYW2htRXtaAHy1qrAoaxRW1zGHesQEgNanKH',
        [
          141, 94, 166, 220, 167, 149, 210, 68, 148, 234, 31, 186, 146, 174,
          197, 170, 65, 51, 136, 165, 151, 110, 191, 122, 109, 6, 95, 43, 199,
          253, 91, 182, 19, 100, 148, 113, 148, 11, 117, 79, 126, 31, 32, 218,
          97, 97, 246, 199, 13, 51, 192, 5, 67, 17, 212, 172, 112, 233, 154,
          184, 120, 50, 175, 16,
        ]
      ),
      voterWeight: new BN('3829473823'),
      membership: [
        {
          clan: {
            address: new PublicKey(
              '3Vq4TzPeLEGsDEpodMX8k3L6vXpebd55xEEz4V8U89LV'
            ),
            owner: new PublicKey(
              'Dtp9QU2V2ysqAPbQHwUZQGbaC9BRsWpZ3Nr6ubUP8LdA'
            ),
            name: 'Marinade',
            permanentMembers: new BN(1),
            leavingMembers: new BN(1),
          },
          shareBp: 10000,
        },
      ],
    },
    clanLeavingTimeOffset: new BN(-200),
  },
];
