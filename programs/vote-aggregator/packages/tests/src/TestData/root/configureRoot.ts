import {PublicKey} from '@solana/web3.js';
import {RealmTestData} from '../../SplGovernance/realm';
import {BN} from '@coral-xyz/anchor';
import {RootTestData} from '../../VoteAggregator/root';
import {buildKeypair} from '../..';

export type ConfigureRootTestData = {
  realm: RealmTestData;
  root: RootTestData;
  maxProposalLifetime?: BN;
  voterWeightResetStep?: BN;
  nextVoterWeightResetOffset?: BN | null;
  paused?: boolean;
  votingWeightPlugin?: PublicKey;
  error?: string;
};

export const configureRootTestData: ConfigureRootTestData[] = [
  {
    realm: {
      splGovernanceId: new PublicKey(
        '6VQRT3WaXjh6J2LfsYfsrTjFwDkkQhE2DVT6sPACJVBd'
      ),
      realmAddress: new PublicKey(
        'CK1VnpRfpYmGNNNnp9MDYTpKLDrwwXVbSXSMEbTzujHv'
      ),
      authority: buildKeypair(
        '91kqKkYveAy8JJgvLEcKQr8QLUN8uNUhcz34QwFDz8hn',
        [
          237, 120, 105, 249, 201, 66, 25, 103, 164, 199, 71, 255, 113, 123,
          164, 13, 101, 221, 20, 165, 59, 151, 73, 0, 164, 127, 235, 172, 31,
          21, 11, 96, 119, 15, 14, 198, 240, 19, 46, 179, 110, 236, 23, 178,
          252, 228, 102, 218, 247, 93, 32, 175, 111, 255, 124, 166, 93, 238,
          197, 100, 73, 137, 249, 161,
        ]
      ),
      communityMint: new PublicKey(
        '6rN6XYMQhYzYeKpsTxh3GGCyeapXsVDzBYAfSYvie2HE'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(32),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'C2H4C25jMVnVC1GVLvTS2ezXZR8a2coeqMcC7rGsSo7U'
      ),
    },
    root: {
      side: 'community',
    },
    maxProposalLifetime: new BN(10230),
    voterWeightResetStep: new BN(3452353),
    nextVoterWeightResetOffset: new BN(237),
    paused: true,
  },
  {
    realm: {
      splGovernanceId: new PublicKey(
        '8DTHvyJQ8793GPBsWLgpHGzcntEHA1CpVuFFdHKP6fQ8'
      ),
      realmAddress: new PublicKey(
        '9ZkuvrkpK8VRL4bVE6hTgLgGmHQ6QYtFs86mpLYHxEu3'
      ),
      authority: buildKeypair(
        'CVmaerBr773B2vJThgAPRLawtQzECyATZk55iBHZE12N',
        [
          43, 135, 102, 150, 246, 77, 187, 213, 64, 185, 237, 219, 151, 168,
          232, 206, 58, 141, 111, 55, 46, 65, 162, 232, 137, 150, 68, 40, 86,
          192, 236, 80, 170, 207, 57, 209, 168, 163, 182, 242, 129, 213, 242,
          63, 80, 106, 23, 186, 218, 185, 56, 152, 162, 128, 190, 12, 17, 146,
          216, 135, 41, 141, 53, 87,
        ]
      ),
      communityMint: new PublicKey(
        '2PirwBE1iue8SRknrw51PwxtDhLdax8xXnoa9oX7goHZ'
      ),
      communityMintMaxVoterWeightSource: {
        supplyFraction: new BN(32),
      },
      minCommunityWeightToCreateGovernance: new BN(4),
      name: 'Community side, no plugins',
      communityMintAuthority: new PublicKey(
        'HVFkFdjyRs48m2XurpacY7RSaLzXJTeyPQd2wRd9vQky'
      ),
    },
    root: {
      side: 'community',
      paused: true,
      votingWeightPlugin: new PublicKey(
        'CjLrEkUWo7en4DAFfpmMjTz9PGzC7xGQ6sdZTQBpbKiy'
      ),
    },
    maxProposalLifetime: new BN(10230),
    voterWeightResetStep: new BN(3452353),
    nextVoterWeightResetOffset: new BN(237),
    paused: false,
    votingWeightPlugin: new PublicKey(
      'FWFrQ1sAq9JAEuyGdN2T6oEkGLVdKPmYBt5g2eNgNgjr'
    ),
  },
];
