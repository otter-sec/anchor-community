import BN from 'bn.js';
import {MemberTestData, RootTestData} from '../../VoteAggregator';
import {
  RealmTestData,
  VoterWeightRecordTestData,
} from '../../SplGovernance/realm';
import {PublicKey} from '@solana/web3.js';

export type UpdateVoterWeightTestData = {
  realm: RealmTestData;
  root: RootTestData;
  member: MemberTestData;
  memberVoterWeightRecord: VoterWeightRecordTestData;
  error?: string;
};

export const updateVoterWeightTestData: UpdateVoterWeightTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '4tvR4DTcn5oPzEJwDnnMViDFntkBvQd6xCfRuv1BHEdT'
      ),
      realmAddress: new PublicKey(
        'CzQ4qpA5DBBWEhKg4CF2mdgPRracUs9YwBq8wh6a7vzm'
      ),
      communityMint: new PublicKey(
        'GxwLNdvN94J7KaxxGh7YqZ3d7EvNJoNQwFi4QSeAoQqY'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'BpAC7gvXmizEWbHS5J4LLg3gCmoEzUGaKkXnanzsk18Y'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        '71ZCkFwQJ6XQGED3vSmWS82LVFJ3D3rrjim7fBhRK9DR'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: new PublicKey('GJg6gMQi5grB2HauhxUjHWCQtiKw1UQZjdr42q8Bm5Nq'),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        'ARCxoQhmN1Tm7Ys8idoEtUaZxPnzomwUSWSK9zzNrBTu'
      ),
      membership: [
        {
          clan: {
            address: new PublicKey(
              '65i8C7Ku6npVGfZ97JRPN7GSv3kSbwQAbFFzTpEaMrZk'
            ),
            owner: new PublicKey(
              '3Cs2UNZ8Yp6yKPyiw3Lb6mRjvPNWcX3d3HUyqcb27rAN'
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
      address: new PublicKey('ARCxoQhmN1Tm7Ys8idoEtUaZxPnzomwUSWSK9zzNrBTu'),
      plugin: new PublicKey('71ZCkFwQJ6XQGED3vSmWS82LVFJ3D3rrjim7fBhRK9DR'),
    },
  },
  {
    realm: {
      splGovernanceId: new PublicKey(
        'HCKSDeSXuF7VHbnbjgN9tVBFMhhx1w4mz58rjijARuV9'
      ),
      realmAddress: new PublicKey(
        '9PBPf1ps543ATwmFuYWx6v9kLH29SYurfgAR9Q6SoDZB'
      ),
      communityMint: new PublicKey(
        'AJ3picghVVb2aLzGZ758iwkQBAKZKekYyoC8tEuV6xrF'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '3kRP1BbeHr3B1M8VrGJy6pMu9anzmY3vzVfaonqwaway'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        '6UDnj7hHk8e6qMEkrzz3mDK8rZp6CmgECPbagGTELELR'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: new PublicKey('AueehoaxKG2ab6VaGu9nq8zNxtXt6fWcBaPRtvcmDzoB'),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        '6SAXMdubziD3svnJYQmXch6tCzSPRw6p45fpYGUb2LuB'
      ),
      membership: [
        {
          clan: {
            address: new PublicKey(
              '7hcLB9waCHCurBv1syRrTQeL4x4rbvqZc4JNxmF33uD6'
            ),
            owner: new PublicKey(
              '7i1xVe5v8LgoZWp8a1ecr2htmGBioRJjpp8aQRoCVeHN'
            ),
            name: 'Marinade',
            permanentMembers: new BN(2),
            voterWeight: new BN('43564574675566'),
            permanentVoterWeight: new BN('43564574675566'),
          },
          shareBp: 10000,
          exitableAt: new BN('892374238439232'),
        },
      ],
    },
    memberVoterWeightRecord: {
      voterWeight: new BN('7489342343'),
      voterWeightExpiry: null,
      address: new PublicKey('6SAXMdubziD3svnJYQmXch6tCzSPRw6p45fpYGUb2LuB'),
      plugin: new PublicKey('6UDnj7hHk8e6qMEkrzz3mDK8rZp6CmgECPbagGTELELR'),
    },
  },
  {
    realm: {
      splGovernanceId: new PublicKey(
        'DTtPkWT2Yun1G1FdP1NkU72rsZKxZPKK5ma7eMzFHrxL'
      ),
      realmAddress: new PublicKey(
        '3ZWoU7B1BYpPe3GKhnKutQPY47bsEQgWpTRGaEEpmqa5'
      ),
      communityMint: new PublicKey(
        '3LWsnqXx8cztVfKR2THqCCB3QxdcRBW2WnTAGZ86E2qG'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(25),
      },
      minCommunityWeightToCreateGovernance: new BN(6),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'HJG4EGj49T9QsKRb4xLJjvYrS7FV4rZUmusyRBVLdQQN'
      ),
    },
    root: {
      side: 'community',
      maxProposalLifetime: new BN(172800),
      votingWeightPlugin: new PublicKey(
        '9adSMtwmoskhNLUZtisYVxDgtgjpYEcBZJM5VufmD9ds'
      ),
      maxVoterWeight: new BN('107428734639842'),
    },
    member: {
      owner: new PublicKey('488BvKapmVcin7KiEDuh7AxKXxepXqPesZvLF8AGZLnc'),
      voterWeight: new BN('7296622000'),
      voterWeightRecord: new PublicKey(
        'FwnknQ12tPLDF6jVT18zBNtDUywfsR3uMxwKn6x2SXoP'
      ),
    },
    memberVoterWeightRecord: {
      voterWeight: new BN('7489342343'),
      voterWeightExpiry: null,
      address: new PublicKey('FwnknQ12tPLDF6jVT18zBNtDUywfsR3uMxwKn6x2SXoP'),
      plugin: new PublicKey('9adSMtwmoskhNLUZtisYVxDgtgjpYEcBZJM5VufmD9ds'),
    },
  },
];
