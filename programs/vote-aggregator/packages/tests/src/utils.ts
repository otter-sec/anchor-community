import {Idl, Program, Event} from '@coral-xyz/anchor';
import {IdlEvent} from '@coral-xyz/anchor/dist/cjs/idl.js';
import {Keypair, PublicKey} from '@solana/web3.js';
import assert from 'assert';

export const buildKeypair: (pub: string, secret: number[]) => Keypair = (
  pub,
  secret
) => {
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
  assert(keypair.publicKey.equals(new PublicKey(pub)));
  return keypair;
};

export function parseLogLine<P extends Idl, T>(
  program: Program<P>,
  log: string
) {
  const PROGRAM_LOG = 'Program log: ';
  const PROGRAM_DATA = 'Program data: ';
  const PROGRAM_LOG_START_INDEX = PROGRAM_LOG.length;
  const PROGRAM_DATA_START_INDEX = PROGRAM_DATA.length;

  if (log.startsWith(PROGRAM_LOG) || log.startsWith(PROGRAM_DATA)) {
    const logStr = log.startsWith(PROGRAM_LOG)
      ? log.slice(PROGRAM_LOG_START_INDEX)
      : log.slice(PROGRAM_DATA_START_INDEX);
    return program.coder.events.decode<IdlEvent, T>(logStr);
  }
  return null;
}

export function parseLogsEvent<P extends Idl>(
  program: Program<P>,
  logs: string[]
): Event[] {
  return logs.map(l => parseLogLine(program, l)).filter(e => e) as Event[];
}

const ACCOUNT_STORAGE_OVERHEAD = 128;
const DEFAULT_LAMPORTS_PER_BYTE_YEAR = Math.floor(
  ((1_000_000_000 / 100) * 365) / (1024 * 1024)
);
const DEFAULT_EXEMPTION_THRESHOLD = 2.0;

export function getMinimumBalanceForRentExemption(bytes: number) {
  return (
    (ACCOUNT_STORAGE_OVERHEAD + bytes) *
    DEFAULT_LAMPORTS_PER_BYTE_YEAR *
    DEFAULT_EXEMPTION_THRESHOLD
  );
}
