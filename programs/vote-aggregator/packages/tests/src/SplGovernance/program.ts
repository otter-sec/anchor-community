import {AnchorProvider} from '@coral-xyz/anchor';
import {splGovernanceProgram} from '@coral-xyz/spl-governance';
import {Connection, PublicKey} from '@solana/web3.js';

export const buildSplGovernanceProgram = ({
  splGovernanceId,
  connection = new Connection('http://localhost:8899'),
}: {
  splGovernanceId: PublicKey;
  connection?: Connection;
}) =>
  splGovernanceProgram({
    programId: splGovernanceId,
    provider: new AnchorProvider(
      connection,
      {
        signTransaction: t => Promise.resolve(t),
        signAllTransactions: ts => Promise.resolve(ts),
        publicKey: PublicKey.default,
      },
      {}
    ),
  });
