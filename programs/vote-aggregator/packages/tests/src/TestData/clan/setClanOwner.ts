import {Keypair, PublicKey} from '@solana/web3.js';
import {ClanTestData} from '../../VoteAggregator';
import {buildKeypair} from '../..';

export type SetClanOwnerTestData = {
  clan: ClanTestData & {root: PublicKey};
  clanAuthority: Keypair | 'owner';
  newOwner: PublicKey;
  error?: string;
};

export const setClanOwnerTestData: SetClanOwnerTestData[] = [
  {
    clan: {
      root: new PublicKey('8qKxmU6GpvTjKu3pyBF5bLwZpaX431y3pmCnrkjuC2hj'),
      address: new PublicKey('7GYCtRSpMmTMgxWvg7NtW5ESw9yX3jXBmNMw7wvn7D41'),
      owner: buildKeypair(
        '4P4rFuYLKjF3WPLiof8XYXEzdHoiT6ofVaxU2YP8u5hR',
        [
          200, 127, 65, 211, 234, 65, 3, 89, 112, 221, 87, 131, 26, 196, 81, 63,
          35, 253, 55, 77, 110, 25, 190, 51, 56, 224, 250, 164, 90, 239, 151,
          244, 50, 58, 48, 226, 12, 255, 27, 48, 48, 126, 41, 86, 68, 73, 247,
          230, 207, 115, 76, 93, 63, 24, 159, 33, 169, 227, 152, 20, 114, 131,
          198, 72,
        ]
      ),
      name: 'Marinade',
      description: 'Marinade is a test clan',
      size: 1000,
    },
    clanAuthority: 'owner',
    newOwner: new PublicKey('7gBxbecBEj5k9EN4Yao6fT75AVuyz2irKoqKgxgRCYMh'),
  },
];
