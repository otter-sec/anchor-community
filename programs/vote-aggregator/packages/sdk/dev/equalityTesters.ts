import {expect} from '@jest/globals';
import {PublicKey} from '@solana/web3.js';
import BN from 'bn.js';

// Use to global configuration of Jest
/*
 * / * * @type {import('ts-jest').JestConfigWithTsJest} * /
 * module.exports = {
 *   setupFilesAfterEnv: ['<rootDir>/setup/equalityTesters.ts'],
 * }
 */

/**
 * Equality testers for jest to compare BN and PublicKey.
 */
expect.addEqualityTesters([
  (a: unknown, b: unknown) => {
    if (a instanceof BN && typeof b === 'number') {
      return a.toNumber() === b;
    }
    return undefined;
  },
  (a: unknown, b: unknown) => {
    if (typeof a === 'number' && b instanceof BN) {
      return a === b.toNumber();
    }
    return undefined;
  },
  (a: unknown, b: unknown) => {
    if (a instanceof BN) {
      return a.eq(b as BN);
    }
    return undefined;
  },
  (a: unknown, b: unknown) => {
    if (a instanceof PublicKey) {
      return a.equals(b as PublicKey);
    }
    return undefined;
  },
]);
