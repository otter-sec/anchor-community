import {AnchorProvider, Program} from '@coral-xyz/anchor';
import {Connection, PublicKey} from '@solana/web3.js';
import {VoteAggregator, IDL} from './vote_aggregator';

export const buildVoteAggregatorProgram = ({
  voteAggregatorId = new PublicKey(
    'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
  ),
  connection = new Connection('http://localhost:8899'),
}: {
  voteAggregatorId?: PublicKey;
  connection?: Connection;
}) => {
  return new Program<VoteAggregator>(
    IDL,
    voteAggregatorId,
    new AnchorProvider(
      connection,
      {
        signTransaction: t => Promise.resolve(t),
        signAllTransactions: ts => Promise.resolve(ts),
        publicKey: PublicKey.default,
      },
      {}
    )
  );
};
