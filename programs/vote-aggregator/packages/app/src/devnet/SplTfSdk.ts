import {Program, Provider} from '@coral-xyz/anchor';
import {IDL, SplTf} from './spl_tf';
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {BN} from 'bn.js';
import {SYSTEM_PROGRAM_ID} from '@solana/spl-governance';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

class ReadonlyProvider implements Provider {
  constructor(public connection: Connection) {}
}

export class SplTfSdk {
  readonly program: Program<SplTf>;

  constructor({connection}: {connection: Connection}) {
    this.program = new Program(
      IDL,
      new PublicKey('stfk3kkv5E2cUuXLSNVAfQfj4mAdVCFhdPYrWzQogCq'),
      new ReadonlyProvider(connection)
    );
  }

  async install({mint, payer}: {mint: PublicKey; payer: PublicKey}) {
    const [faucet] = PublicKey.findProgramAddressSync(
      [Buffer.from('address', 'utf-8'), mint.toBuffer()],
      this.program.programId
    );
    return await this.program.methods
      .initFaucet(new BN(10 * LAMPORTS_PER_SOL))
      .accountsStrict({
        faucet,
        mint,
        admin: payer,
        payer,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
  }

  async airdrop({mint, payer}: {mint: PublicKey; payer: PublicKey}) {
    const [faucet] = PublicKey.findProgramAddressSync(
      [Buffer.from('address', 'utf-8'), mint.toBuffer()],
      this.program.programId
    );
    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint-auth', 'utf-8'), faucet.toBuffer()],
      this.program.programId
    );
    const target = await getAssociatedTokenAddressSync(mint, payer);
    return await this.program.methods
      .airdrop(new BN(10 * LAMPORTS_PER_SOL))
      .accountsStrict({
        faucet,
        mint,
        payer,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        mintAuthority,
        target,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .transaction();
  }
}
