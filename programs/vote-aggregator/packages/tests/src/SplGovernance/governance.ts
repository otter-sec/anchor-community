import {PublicKey} from '@solana/web3.js';
import {GovernanceAccount, GovernanceConfig} from './accounts';
import {buildSplGovernanceProgram} from './program';
import {RealmTester} from './realm';
import BN from 'bn.js';
import {AddedAccount} from 'solana-bankrun';
import {getMinimumBalanceForRentExemption} from '../utils';

export type GovernanceTestData = {
  address: PublicKey;
  governedAccount?: PublicKey;
  config: GovernanceConfig;
  activeProposalCount: BN;
};

export class GovernanceTester {
  realm: RealmTester;
  governanceAddress: PublicKey;
  governance: GovernanceAccount;
  constructor({
    address,
    governedAccount = PublicKey.default,
    config,
    realm,
    activeProposalCount,
  }: GovernanceTestData & {realm: RealmTester}) {
    this.governanceAddress = address;
    this.realm = realm;
    this.governance = {
      accountType: {
        governanceV2: {},
      },
      realm: realm.realmAddress,
      governedAccount,
      reserved1: 0,
      config,
      reservedV2: new Array(120).fill(0),
      activeProposalCount,
      requiredSignatoriesCount: 0,
    };
  }

  async account(): Promise<AddedAccount> {
    const program = buildSplGovernanceProgram({
      splGovernanceId: this.realm.splGovernanceId,
    });
    let governanceData = await program.coder.accounts.encode<GovernanceAccount>(
      'governanceV2',
      this.governance
    );
    governanceData = Buffer.concat([
      governanceData,
      Buffer.alloc(236 - governanceData.length),
    ]);
    return {
      address: this.governanceAddress,
      info: {
        executable: false,
        owner: program.programId,
        lamports: getMinimumBalanceForRentExemption(governanceData.length),
        data: governanceData,
      },
    };
  }
}
