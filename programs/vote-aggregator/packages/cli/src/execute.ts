import {
  MessageV0,
  Signer,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import {context} from './context';
import {serializeInstructionToBase64} from '@solana/spl-governance';
import * as anchor from '@coral-xyz/anchor';

export const execute = async ({
  instructions,
  signers,
}: {
  instructions: TransactionInstruction[];
  signers?: Signer[];
}) => {
  const {provider, simulate, print} = context!;

  const {blockhash, lastValidBlockHeight} =
    await provider.connection.getLatestBlockhash();

  if (simulate) {
    const tx = new Transaction({
      feePayer: provider.publicKey,
      blockhash,
      lastValidBlockHeight,
    });
    tx.add(...instructions);
    console.log(JSON.stringify(await provider.simulate!(tx, signers)));
  }

  if (print) {
    switch (print) {
      case 'multisig':
        console.log('Instructions:\n');
        for (const ix of instructions) {
          console.log(serializeInstructionToBase64(ix));
          console.log();
        }
        break;
      case 'legacy': {
        const tx = new Transaction({
          feePayer: provider.publicKey,
          blockhash,
          lastValidBlockHeight,
        });
        tx.add(...instructions);
        console.log('Transaction:\n');
        console.log(
          anchor.utils.bytes.base64.encode(tx.compileMessage().serialize())
        );
        break;
      }
      case '0': {
        const txv0 = new VersionedTransaction(
          MessageV0.compile({
            payerKey: provider.publicKey!,
            instructions,
            recentBlockhash: blockhash,
          })
        );
        console.log('Transaction:\n');
        console.log(
          anchor.utils.bytes.base64.encode(Buffer.from(txv0.serialize()))
        );
        break;
      }
    }
    return; // Do not execute transaction
  }

  const tx = new Transaction({
    feePayer: provider.publicKey,
    blockhash,
    lastValidBlockHeight,
  });
  tx.add(...instructions);

  const signature = await provider.sendAndConfirm!(tx, signers);
  console.log(`Success ${signature}`);
};
