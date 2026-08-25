import BN from 'bn.js';
import {MemberTestData, RootTestData} from '../../VoteAggregator';
import {
  RealmTestData,
  VoterWeightRecordTestData,
} from '../../SplGovernance/realm';
import {PublicKey} from '@solana/web3.js';
import {buildKeypair} from '../../utils';

export type SetVoterWeightRecordTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: MemberTestData;
  memberVoterWeightRecord: VoterWeightRecordTestData;
  error?: string;
};

export const setVoterWeightRecordTestData: SetVoterWeightRecordTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '7CNLkvbS8Y9Kw2XEWMbiDWAFkmH1egzYywnkcLAzDQfk'
      ),
      realmAddress: new PublicKey(
        '3nwn3gg873XR6oFYrYfo1ugXkxAFaLAN7UEGQDp7gnbn'
      ),
      communityMint: new PublicKey(
        'JAcH9JrbGwcf8qJPFzfAEgvHzEfKJxyyHvJuwGfsvBQE'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '6E8CB87xD7MySFHeXSaDaVHvJkq2Dt2Ekm9i99Q1fT4E'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        'CZufQ6Qe5fPmq5YC5GWDFL9pH83exFMNHhbBJJQuzd7o'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: buildKeypair(
        'HuaFGT8nfMxDjHSjHgNDT4hLZftsdZe8QHvg5aepjBwY',
        [
          181, 124, 137, 203, 83, 247, 84, 28, 81, 150, 135, 56, 28, 38, 39,
          192, 125, 160, 61, 182, 154, 241, 52, 52, 175, 147, 126, 106, 124,
          132, 127, 21, 251, 50, 200, 195, 146, 88, 176, 89, 234, 180, 146, 100,
          27, 187, 104, 53, 63, 15, 114, 83, 193, 136, 159, 97, 111, 80, 151,
          66, 254, 243, 233, 163,
        ]
      ),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        'EUGQWWk5B7mSUz3fe246AmzBQv8Myr4LCagH1pDZ36St'
      ),
      membership: [
        {
          clan: {
            address: new PublicKey(
              'GYV657WS94UU9TRy3Pfy541vDozNzBa9aQL2YKpLpyJv'
            ),
            owner: new PublicKey(
              'E37eVKwMqnwgTJaVYJcYCprm9w89E1H3DU4C4ARqZkG8'
            ),
            name: 'Marinade',
            permanentMembers: new BN(2),
            voterWeight: new BN('43564574675566'),
            permanentVoterWeight: new BN('43564574675566'),
          },
          shareBp: 10000,
        },
      ],
    },
    memberVoterWeightRecord: {
      voterWeight: new BN('7489342343'),
      voterWeightExpiry: null,
      address: new PublicKey('Djribmj2nyN27ydbAfLYZL6TSEaLmJ5BtaA3GBDV5ttq'),
      plugin: new PublicKey('CZufQ6Qe5fPmq5YC5GWDFL9pH83exFMNHhbBJJQuzd7o'),
    },
  },
  {
    realm: {
      splGovernanceId: new PublicKey(
        'HiuYrXM4q71gucyNrLPErxGN5iu97iKcjUrR3DvpTeuA'
      ),
      realmAddress: new PublicKey(
        'Hgbn7gbJvNe55Q2oxNnnoiLELxv73FsbskmuevQwgqi6'
      ),
      communityMint: new PublicKey(
        '5hGUznh6bGqkuxxGkqZZWFA4bA9DzK9v2M3B8498f6Bp'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '8MbL8DjZxY5Ce22xPfpHscKUyzmtPFHEreZo6ewsC1mL'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        'E9q7RNwFSnxPU77fgLPhToL1JVE8o7hA1ozbDE2huHSK'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: buildKeypair(
        '6EGK73rCovYf2mKMrNyzNMTXuq1bMDZAM23LVLW1bB3J',
        [
          174, 0, 203, 247, 197, 235, 76, 94, 217, 78, 103, 60, 227, 163, 13,
          111, 233, 183, 9, 168, 254, 39, 216, 88, 117, 153, 158, 206, 183, 104,
          71, 251, 77, 176, 76, 116, 0, 101, 47, 26, 150, 225, 246, 21, 38, 48,
          128, 52, 204, 50, 201, 43, 46, 34, 110, 238, 171, 75, 72, 161, 12,
          110, 136, 29,
        ]
      ),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        'QvTnnh5pQrYAwZieL4G8a2TmqUGsg9Fj3Sb8NQjBmjQ'
      ),
      membership: [
        {
          clan: {
            address: new PublicKey(
              'DdRA96x57UUBNEKgjmxohYEMUQhzZZ4PD2tNCzc7Cimt'
            ),
            owner: new PublicKey(
              '7gMLxHEDuafTnJMY1M3GzQfqiMMVjv5Zc8u7aUxNjSw7'
            ),
            name: 'Marinade',
            permanentMembers: new BN(2),
            voterWeight: new BN('43564574675566'),
            permanentVoterWeight: new BN('43564574675566'),
          },
          shareBp: 10000,
          exitableAt: new BN('8923742384232'),
        },
      ],
    },
    memberVoterWeightRecord: {
      voterWeight: new BN('7489342343'),
      voterWeightExpiry: null,
      address: new PublicKey('FPTcxdXuQRNrL54T43CayecX424PamXdVB3estSuqpvG'),
      plugin: new PublicKey('E9q7RNwFSnxPU77fgLPhToL1JVE8o7hA1ozbDE2huHSK'),
    },
  },
  {
    realm: {
      splGovernanceId: new PublicKey(
        '7TCWnbHRMbTuWscPE8YfFwzffbc5AVPs5xiBmSPyuAeS'
      ),
      realmAddress: new PublicKey(
        'DsbLrmX6RHwwPveTvqFzRX568fF6isN8Fhm3bRicRet5'
      ),
      communityMint: new PublicKey(
        '4fncHMwJQWSEwexzkdiyRJcmqLEwAFLnXgE8N8ynCNHD'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'BJpmPJBAYXWu3vmqvK6p1TJKXQVkp7HXPdxMJccE5VQB'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        '7tD4nQi7eaivX8JPQ8XCKAQT4QREKWmRYnjXcV1JB9ZN'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: buildKeypair(
        '6KiEjpSdqENWWYxrpFaRm4wX4n2gBpSS1WEdYoX1DPH8',
        [
          196, 206, 20, 216, 142, 216, 22, 247, 100, 242, 212, 206, 196, 218,
          94, 151, 134, 196, 60, 164, 139, 103, 164, 120, 149, 31, 209, 201,
          134, 91, 65, 50, 79, 21, 132, 15, 243, 130, 210, 124, 193, 58, 52, 17,
          38, 181, 196, 195, 163, 3, 223, 237, 136, 226, 40, 108, 25, 237, 38,
          196, 99, 196, 6, 95,
        ]
      ),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        '34PfJRYDjvn4o4Q17KB15E8ML7t5agwJLn4iZeGtxfbu'
      ),
    },
    memberVoterWeightRecord: {
      voterWeight: new BN('7489342343'),
      voterWeightExpiry: null,
      address: new PublicKey('Djribmj2nyN27ydbAfLYZL6TSEaLmJ5BtaA3GBDV5ttq'),
      plugin: new PublicKey('7tD4nQi7eaivX8JPQ8XCKAQT4QREKWmRYnjXcV1JB9ZN'),
    },
  },
];
