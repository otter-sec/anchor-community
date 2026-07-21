import {Keypair, PublicKey} from '@solana/web3.js';
import {ClanTestData, buildKeypair} from '../..';
import {RealmTestData} from '../../SplGovernance/realm';
import {RootTestData} from '../../VoteAggregator/root';
import {BN} from '@coral-xyz/anchor';

export type SetVotingDelegateTestData = {
  realm: RealmTestData;
  root: RootTestData;
  clan: ClanTestData;
  clanAuthority: Keypair | 'owner' | 'delegate';
  newVotingDelegate: PublicKey | null;
  error?: string;
};

export const setVotingDelegateTestData: SetVotingDelegateTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '9nFWsaXRuQ3ttgotdbYobW7FUYqfYgH1xnxQ3XXS6K2Z'
      ),
      realmAddress: new PublicKey(
        'C3cm2YUaHDpBiridsRssYi5VS4TWebHgctHciRsjSfnm'
      ),
      communityMint: new PublicKey(
        'A3193fk6RBq7gNrxoMnBVbM84QAwTFsMeApuQanAYf5c'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(11),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'C3NoAEBgWK1sYZbjMRgfPQKhyMybEnSQ2trafahyB1to'
      ),
    },
    root: {
      side: 'community',
    },
    clan: {
      address: new PublicKey('DuM9aEHBoBXutMXhwHs7pcNjUjTP7B5LP5DFHSDm1fkb'),
      owner: buildKeypair(
        'BMstgCn75bL2K9UkYgZfzzbARHq8ACYvYAXNCD9BgB8P',
        [
          59, 206, 55, 242, 128, 12, 203, 232, 225, 73, 6, 26, 143, 231, 157,
          34, 6, 78, 91, 241, 94, 39, 133, 70, 47, 240, 57, 224, 4, 10, 230, 89,
          153, 238, 7, 45, 186, 182, 56, 112, 210, 46, 57, 55, 172, 53, 207, 94,
          123, 154, 68, 244, 127, 182, 235, 57, 59, 181, 12, 210, 232, 145, 60,
          76,
        ]
      ),
      name: 'Marinade',
    },
    clanAuthority: 'owner',
    newVotingDelegate: new PublicKey(
      '27xW6TahhTYYfH6616k2xsGjpFsBuGeGgxDETPxN4r9K'
    ),
  },
];
