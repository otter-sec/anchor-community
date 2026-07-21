import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {ClanTestData} from '../..';
import {RealmTestData} from '../../SplGovernance/realm';
import {RootTestData} from '../../VoteAggregator/root';
import {BN} from '@coral-xyz/anchor';
import {ProposalTestData} from '../../SplGovernance';
import {GovernanceTestData} from '../../SplGovernance/governance';
import {VoteTestData} from '../../SplGovernance/vote';

export type UpdateProposalVoteTestData = {
  realm: RealmTestData;
  root: RootTestData;
  clan: ClanTestData;
  governance: GovernanceTestData;
  proposal: ProposalTestData;
  vote: VoteTestData;
  error?: string;
};

export const updateProposalVoteTestData: UpdateProposalVoteTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '3xNbuehooXRpHEbntV4BCwaaMdLHrGcfvjdopTA6idRq'
      ),
      realmAddress: new PublicKey(
        'GCfsGVkUtbJTXC1uU6qNTktghf1ND4Mn1gqWYHrKU7c3'
      ),
      communityMint: new PublicKey(
        '4uynsQ25jPGzpK7ZwFYB5R7Qvy6reXe3pRBpws3sFE8G'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(11),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '8Uht9C3S3vCs5EoLwZbHNEXG3Z1ozmWB8uD6unKZphU6'
      ),
    },
    root: {
      side: 'community',
    },
    clan: {
      address: new PublicKey('5nYvDD2VT4Zx1kxNohfATAAMMxpajEQkaD4vyHrNyGJR'),
      owner: new PublicKey('BSwbVWvLWo1xC9TJVoc6fPXccQLzGKYBoTicdqtncoj8'),
      name: 'Marinade',
      unrelinquishedVotesCount: new BN(1),
    },
    governance: {
      address: new PublicKey('2TrqzfsojMCXBpR2RoRGf6vJ39hP1fcYZ3qvzTSU5tAc'),
      config: {
        communityVoteThreshold: {
          yesVotePercentage: [60],
        },
        minCommunityWeightToCreateProposal: new BN(LAMPORTS_PER_SOL),
        minTransactionHoldUpTime: 0,
        votingBaseTime: 100000000,
        communityVoteTipping: {early: {}},
        councilVoteThreshold: {yesVotePercentage: [50]},
        councilVetoVoteThreshold: {yesVotePercentage: [50]},
        minCouncilWeightToCreateProposal: new BN(LAMPORTS_PER_SOL),
        councilVoteTipping: {early: {}},
        communityVetoVoteThreshold: {yesVotePercentage: [50]},
        votingCoolOffTime: 0,
        depositExemptProposalCount: 0,
      },
      activeProposalCount: new BN(1),
    },
    proposal: {
      address: new PublicKey('YmoYimqAG2EVcn5RdW9od3jXNNEGRLvg65yCGkuqWMY'),
      governingTokenMint: new PublicKey(
        '4uynsQ25jPGzpK7ZwFYB5R7Qvy6reXe3pRBpws3sFE8G'
      ),
      state: {voting: {}},
      owner: new PublicKey('DKLu1t8A1NDXpvygyQSRU3VCjiwTVvb6vzm9UD6uPJJn'),
      signatoriesCount: 0,
      signatoriesSignedOffCount: 0,
      voteType: {singleChoice: {}},
      options: [
        {
          label: 'First',
          voteWeight: new BN(1000),
          voteResult: {none: {}},
          transactionsExecutedCount: 0,
          transactionsCount: 0,
          transactionsNextIndex: 0,
        },
      ],
      draftAt: new BN(0),
      votingAt: new BN(10000000000),
      voteThreshold: {yesVotePercentage: [20]},
      name: 'Some proposal',
      descriptionLink: 'description',
      vetoVoteWeight: new BN('0'),
    },
    vote: {
      isRelinquished: false,
      voterWeight: new BN(100),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vote: {approve: [{rank: 0, weightPercentage: 100} as any]},
    },
  },
];
