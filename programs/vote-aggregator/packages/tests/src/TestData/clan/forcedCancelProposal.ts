import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {ClanTestData} from '../..';
import {RealmTestData} from '../../SplGovernance/realm';
import {RootTestData} from '../../VoteAggregator/root';
import {BN} from '@coral-xyz/anchor';
import {ProposalTestData} from '../../SplGovernance';
import {GovernanceTestData} from '../../SplGovernance/governance';

export type ForcedCancelProposalTestData = {
  realm: RealmTestData;
  root: RootTestData;
  clan: ClanTestData;
  governance: GovernanceTestData;
  proposal: ProposalTestData;
  error?: string;
};

export const forcedCancelProposalTestData: ForcedCancelProposalTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        'FuxsqmJVij763XWcAnDnZCHA5zDiS8ymEcNytWa5vMUv'
      ),
      realmAddress: new PublicKey(
        '3YFoLc8H5RCfRGd5b33FUtshAUAyAJAnkxWsyjKXC1cX'
      ),
      communityMint: new PublicKey(
        'Chry4N4gDybpm2Jdy4SCUV4SKGgyvPHsKzx95QcVsdx'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(11),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        '4GVC2ac8FxoSBHWwVpQnXPVL4gHXmxNWiwUmPVxeXWDU'
      ),
    },
    root: {
      side: 'community',
    },
    clan: {
      address: new PublicKey('L2VcC3CPVRm7ji8FFizoLfqrXPPjix1TKYhFmBzsUo6'),
      owner: new PublicKey('8QwPjsMnbfsvdvgCwsnvzbdokd2bQmn6ZwzmJ8sGxbzc'),
      name: 'Marinade',
    },
    governance: {
      address: new PublicKey('7oKhNm1H5JJTMeLWCd3xntkmmgzCVT9NAhnLtRxKEJzj'),
      config: {
        communityVoteThreshold: {
          yesVotePercentage: [60],
        },
        minCommunityWeightToCreateProposal: new BN(LAMPORTS_PER_SOL),
        minTransactionHoldUpTime: 0,
        votingBaseTime: 0,
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
      address: new PublicKey('EaVWScKrvjMe94jp45Yt8BGjjPtf2osK1FBc4kmcAJF7'),
      governingTokenMint: new PublicKey(
        'Chry4N4gDybpm2Jdy4SCUV4SKGgyvPHsKzx95QcVsdx'
      ),
      state: {draft: {}},
      signatoriesCount: 0,
      signatoriesSignedOffCount: 0,
      voteType: {singleChoice: {}},
      options: [
        {
          label: 'First',
          voteWeight: new BN(100),
          voteResult: {none: {}},
          transactionsExecutedCount: 0,
          transactionsCount: 0,
          transactionsNextIndex: 0,
        },
      ],
      draftAt: new BN(0),
      voteThreshold: {yesVotePercentage: [20]},
      name: 'Some proposal',
      descriptionLink: 'description',
      vetoVoteWeight: new BN('0'),
    },
  },
];
