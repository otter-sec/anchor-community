import {Keypair, PublicKey} from '@solana/web3.js';
import {ClanTestData} from '../../VoteAggregator';
import {buildKeypair} from '../..';
import BN from 'bn.js';

export type ConfigureClanTestData = {
  clan: ClanTestData & {root: PublicKey};
  clanAuthority: Keypair | 'owner' | 'delegate';
  newDelegate?: PublicKey;
  newName?: string;
  newDescription?: string;
  newMinVotingWeightToJoin?: BN;
  newAcceptTemporaryMembers?: boolean;
  error?: string;
};

export const configureClanTestData: ConfigureClanTestData[] = [
  {
    clan: {
      root: new PublicKey('7yM5fXw8M64eF73SXqnU4Cbs1QsNUM2sRiwCjvmropJ6'),
      address: new PublicKey('4vK9oDnDgPbFGtCwdJvm3hHay9EueHDxJfNoSZMnQEZw'),
      owner: buildKeypair(
        '4NGov9AUKpbbkQU9AaS5ZqhEEzgWG3MSZrziDsLuWQBa',
        [
          144, 65, 137, 187, 226, 210, 92, 164, 117, 223, 216, 213, 155, 153,
          19, 240, 204, 28, 237, 169, 169, 15, 103, 217, 110, 21, 59, 71, 241,
          13, 203, 10, 50, 6, 34, 9, 6, 208, 204, 76, 233, 204, 56, 22, 103,
          175, 32, 153, 194, 176, 105, 137, 18, 68, 226, 213, 219, 48, 139, 32,
          54, 59, 134, 201,
        ]
      ),
      name: 'Marinade',
      description: 'Marinade is a test clan',
      size: 1000,
    },
    clanAuthority: 'owner',
    newDelegate: new PublicKey('Fz9TQxgjdERVNt7hP8DcQQwvM4oXL1oaGSbL1jX6HvJz'),
    newName: 'LIDO',
    newDescription: 'No more marinade',
    newMinVotingWeightToJoin: new BN(100),
    newAcceptTemporaryMembers: false,
  },
];
