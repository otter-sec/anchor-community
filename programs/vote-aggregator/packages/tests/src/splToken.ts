import {AnchorProvider, IdlAccounts} from '@coral-xyz/anchor';
// eslint-disable-next-line node/no-extraneous-import
import {splTokenProgram} from '@coral-xyz/spl-token';
import {Connection, PublicKey} from '@solana/web3.js';

// for types only
const splTokenIdl = () => splTokenProgram().idl;
export type SplTokenIdl = ReturnType<typeof splTokenIdl>;

export type MintAccount = IdlAccounts<SplTokenIdl>['mint'];

export const buildSplTokenProgram = () =>
  splTokenProgram({
    provider: new AnchorProvider(
      new Connection('http://localhost:8899'),
      {
        signTransaction: t => Promise.resolve(t),
        signAllTransactions: ts => Promise.resolve(ts),
        publicKey: PublicKey.default,
      },
      {}
    ),
  });
