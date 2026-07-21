import {Keypair, PublicKey} from '@solana/web3.js';
import {ClanTestData} from '../../VoteAggregator';
import {buildKeypair} from '../..';

export type ResizeClanTestData = {
  clan: ClanTestData & {root: PublicKey};
  clanAuthority: Keypair | 'owner' | 'delegate';
  newSize: number;
  error?: string;
};

export const resizeClanTestData: ResizeClanTestData[] = [
  {
    clan: {
      root: new PublicKey('EEKQJRVojqbyKZNcVhfKjs7nmmfE6jzZMXbCyQp3d62e'),
      address: new PublicKey('21h2D9KgvjsNfzbHvdyUbivGwXMVqAxr6kSh9vgBidMX'),
      owner: buildKeypair(
        'ARhgofNpMqtJwT4KdFN11ELGB3op5Cfgo6APJjrhXVJV',
        [
          249, 138, 148, 130, 179, 70, 142, 26, 80, 244, 243, 61, 211, 87, 163,
          90, 146, 8, 155, 192, 177, 132, 162, 248, 117, 248, 92, 11, 196, 247,
          15, 131, 140, 13, 32, 57, 234, 99, 153, 3, 109, 138, 129, 161, 117,
          169, 141, 191, 175, 184, 192, 221, 203, 205, 49, 192, 133, 247, 135,
          134, 120, 253, 31, 182,
        ]
      ),
      name: 'Marinade',
      description: 'Marinade is a test clan',
    },
    clanAuthority: 'owner',
    newSize: 1200,
  },
];
