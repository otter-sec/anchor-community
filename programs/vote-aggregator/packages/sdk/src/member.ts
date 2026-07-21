import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {VoteAggregatorSdk} from './sdk';
import {IdlAccounts, IdlTypes} from '@coral-xyz/anchor';
import {VoteAggregator} from './vote_aggregator';
import {SYSTEM_PROGRAM_ID, getRealmConfigAddress} from '@solana/spl-governance';
import {VoterWeightAccount} from './clan';
import BN from 'bn.js';

export type MemberAccount = IdlAccounts<VoteAggregator>['member'];
export type MembershipEntry = IdlTypes<VoteAggregator>['MembershipEntry'];

export class MemberSdk {
  constructor(public readonly sdk: VoteAggregatorSdk) {}

  memberAddress({
    rootAddress,
    owner,
  }: {
    rootAddress: PublicKey;
    owner: PublicKey;
  }): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('member', 'utf-8'),
        rootAddress.toBuffer(),
        owner.toBuffer(),
      ],
      this.sdk.programId
    );
  }

  tokenOwnerRecordAddress({
    realmAddress,
    governingTokenMint,
    owner,
    splGovernanceId,
  }: {
    realmAddress: PublicKey;
    governingTokenMint: PublicKey;
    owner: PublicKey;
    splGovernanceId: PublicKey;
  }): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance', 'utf-8'),
        realmAddress.toBuffer(),
        governingTokenMint.toBuffer(),
        owner.toBuffer(),
      ],
      splGovernanceId
    );
  }

  fetchMember({
    memberAddress,
    owner,
    rootAddress,
  }: {
    memberAddress?: PublicKey;
    rootAddress?: PublicKey;
    owner?: PublicKey;
  }): Promise<MemberAccount | null> {
    if (!memberAddress) {
      if (!owner) {
        throw new Error('owner is required');
      }
      if (!rootAddress) {
        throw new Error('rootAddress is required');
      }
      memberAddress = this.memberAddress({rootAddress, owner})[0];
    }
    return this.sdk.program.account.member.fetchNullable(memberAddress);
  }

  async findVoterWeightRecord({
    rootData,
    owner,
  }: {
    rootData: {
      realm: PublicKey;
      governingTokenMint: PublicKey;
      votingWeightPlugin: PublicKey;
    };
    owner: PublicKey;
  }) {
    const voterWeightAccounts = [];

    for (const discriminators of ['8riZd8mYDQk', '9RuW8iaNj6Z']) {
      voterWeightAccounts.push(
        ...(await this.sdk.connection.getProgramAccounts(
          rootData.votingWeightPlugin,
          {
            filters: [
              {
                memcmp: {
                  offset: 0,
                  bytes: discriminators,
                },
              },
              {
                memcmp: {
                  offset: 8,
                  bytes: rootData.realm.toBase58(),
                },
              },
              {
                memcmp: {
                  offset: 8 + 32,
                  bytes: rootData.governingTokenMint.toBase58(),
                },
              },
              {
                memcmp: {
                  offset: 8 + 32 + 32,
                  bytes: owner.toBase58(),
                },
              },
            ],
          }
        ))
      );
    }

    const voterWeightRecords = voterWeightAccounts.map(({account, pubkey}) => {
      // For legasy VWR format rewrite the discriminator
      // because the parser is accepting only the modern anchor-compatible format
      account.data.writeUInt8(46, 0);
      account.data.writeUInt8(249, 1);
      account.data.writeUInt8(155, 2);
      account.data.writeUInt8(75, 3);
      account.data.writeUInt8(153, 4);
      account.data.writeUInt8(248, 5);
      account.data.writeUInt8(116, 6);
      account.data.writeUInt8(9, 7);
      const record = this.sdk.program.coder.accounts.decode<VoterWeightAccount>(
        'voterWeightRecord',
        account.data
      );
      return {
        record,
        pubkey,
      };
    });

    let maxExpiry: BN | null = new BN(0); // already expired
    let maxPower = new BN(0);
    let bestIndex = null;
    for (let i = 0; i < voterWeightRecords.length; i++) {
      const {record} = voterWeightRecords[i];
      if (record.weightAction || record.weightActionTarget) {
        continue;
      }
      if (
        (!record.voterWeightExpiry && maxExpiry) ||
        (maxExpiry && record.voterWeightExpiry?.gt(maxExpiry))
      ) {
        maxExpiry = record.voterWeightExpiry;
        maxPower = record.voterWeight;
        bestIndex = i;
      } else if (
        (record.voterWeightExpiry === null && maxExpiry === null) ||
        (maxExpiry && record.voterWeightExpiry?.eq(maxExpiry))
      ) {
        if (record.voterWeight.gt(maxPower)) {
          maxPower = record.voterWeight;
          bestIndex = i;
        }
      }
    }

    if (bestIndex === null) {
      throw new Error(
        `Can not find VWR for ${owner.toBase58()} in the plugin ${rootData.votingWeightPlugin.toBase58()}`
      );
    }

    return voterWeightRecords[bestIndex];
  }

  async createMemberInstruction({
    rootAddress,
    rootData,
    owner,
    payer = owner,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    owner: PublicKey;
    payer?: PublicKey;
  }) {
    const [memberTor] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      owner,
      splGovernanceId: rootData.governanceProgram,
    });
    const [member] = this.memberAddress({rootAddress, owner});
    return await this.sdk.program.methods
      .createMember()
      .accountsStrict({
        root: rootAddress,
        member,
        payer,
        systemProgram: SYSTEM_PROGRAM_ID,
        memberTor,
        owner,
      })
      .instruction();
  }

  async createMemberInstructionIfNeeded({
    rootAddress,
    rootData,
    owner,
    payer = owner,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    owner: PublicKey;
    payer?: PublicKey;
  }): Promise<TransactionInstruction[]> {
    const [member] = this.memberAddress({rootAddress, owner});
    if (await this.sdk.connection.getAccountInfo(member)) {
      return [];
    }
    return [
      await this.createMemberInstruction({rootAddress, rootData, owner, payer}),
    ];
  }

  async joinClanInstruction({
    rootData,
    memberAddress,
    memberData,
    clanAddress,
    memberVwr,
    shareBp = 10000,
    payer,
    memberAuthority = memberData.owner,
  }: {
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint?: PublicKey;
    };
    memberAddress?: PublicKey;
    memberData: {
      root: PublicKey;
      owner: PublicKey;
      tokenOwnerRecord?: PublicKey;
      membership: MembershipEntry[];
    };
    clanAddress: PublicKey;
    memberVwr: PublicKey;
    shareBp?: number;
    payer: PublicKey;
    memberAuthority?: PublicKey;
  }) {
    if (!memberAddress) {
      [memberAddress] = this.memberAddress({
        rootAddress: memberData.root,
        owner: memberData.owner,
      });
    }

    let memberTor = memberData.tokenOwnerRecord;
    if (!memberTor) {
      if (!rootData.governingTokenMint) {
        throw new Error('rootData.governingTokenMint is required');
      }

      [memberTor] = this.tokenOwnerRecordAddress({
        realmAddress: rootData.realm,
        governingTokenMint: rootData.governingTokenMint,
        owner: memberData.owner,
        splGovernanceId: rootData.governanceProgram,
      });
    }

    const [lockAuthority] = this.sdk.root.lockAuthority({
      rootAddress: memberData.root,
    });

    const rest: AccountMeta[] = [];
    for (const {clan, exitableAt} of memberData.membership) {
      if (!exitableAt) {
        rest.push({
          pubkey: clan,
          isSigner: false,
          isWritable: true,
        });
        rest.push({
          pubkey: this.sdk.clan.voterWeightAddress(clan)[0],
          isSigner: false,
          isWritable: true,
        });
      }
    }

    return await this.sdk.program.methods
      .joinClan(shareBp)
      .accountsStrict({
        root: memberData.root,
        member: memberAddress,
        clan: clanAddress,
        memberAuthority,
        clanVwr: this.sdk.clan.voterWeightAddress(clanAddress)[0],
        memberTor,
        memberVwr,
        maxVwr: this.sdk.root.maxVoterWieghtAddress({
          rootAddress: memberData.root,
        })[0],
        payer,
        realm: rootData.realm,
        realmConfig: await getRealmConfigAddress(
          rootData.governanceProgram,
          rootData.realm
        ),
        lockAuthority,
        governanceProgram: rootData.governanceProgram,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(rest)
      .instruction();
  }

  async startLeavingClanInstruction({
    memberData,
    memberAddress,
    memberAuthority = memberData.owner,
    clan,
  }: {
    memberData: {
      root: PublicKey;
      owner: PublicKey;
      // delegate: PublicKey;
    };
    memberAddress?: PublicKey;
    memberAuthority?: PublicKey;
    clan: PublicKey;
  }) {
    if (!memberAddress) {
      [memberAddress] = this.memberAddress({
        rootAddress: memberData.root,
        owner: memberData.owner,
      });
    }
    const [clanVwr] = this.sdk.clan.voterWeightAddress(clan);
    return await this.sdk.program.methods
      .startLeavingClan()
      .accountsStrict({
        root: memberData.root,
        member: memberAddress,
        clan,
        memberAuthority,
        clanVwr,
      })
      .instruction();
  }

  async exitClanInstruction({
    rootData,
    memberData,
    memberAddress,
    memberAuthority = memberData.owner,
    clan,
  }: {
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    memberData: {
      root: PublicKey;
      owner: PublicKey;
      tokenOwnerRecord?: PublicKey;
    };
    memberAddress?: PublicKey;
    memberAuthority?: PublicKey;
    clan: PublicKey;
  }) {
    if (!memberAddress) {
      [memberAddress] = this.memberAddress({
        rootAddress: memberData.root,
        owner: memberData.owner,
      });
    }

    let memberTor = memberData.tokenOwnerRecord;
    if (!memberTor) {
      [memberTor] = this.tokenOwnerRecordAddress({
        realmAddress: rootData.realm,
        governingTokenMint: rootData.governingTokenMint,
        owner: memberData.owner,
        splGovernanceId: rootData.governanceProgram,
      });
    }

    const [lockAuthority] = this.sdk.root.lockAuthority({
      rootAddress: memberData.root,
    });

    return await this.sdk.program.methods
      .exitClan()
      .accountsStrict({
        root: memberData.root,
        member: memberAddress,
        clan,
        memberAuthority,
        lockAuthority,
        memberTor,
        governanceProgram: rootData.governanceProgram,
        clanTor: this.sdk.clan.tokenOwnerRecordAddress({
          realmAddress: rootData.realm,
          governingTokenMint: rootData.governingTokenMint,
          splGovernanceId: rootData.governanceProgram,
          clanAddress: clan,
        })[0],
        realm: rootData.realm,
        realmConfig: await getRealmConfigAddress(
          rootData.governanceProgram,
          rootData.realm
        ),
      })
      .instruction();
  }

  async updateVoterWeightInstruction({
    memberData,
    memberAddress,
  }: {
    memberData: {
      root: PublicKey;
      owner: PublicKey;
      voterWeightRecord: PublicKey;
      membership: MembershipEntry[];
    };
    memberAddress?: PublicKey;
  }) {
    if (!memberAddress) {
      [memberAddress] = this.memberAddress({
        rootAddress: memberData.root,
        owner: memberData.owner,
      });
    }

    const rest: AccountMeta[] = [];
    for (const {clan, exitableAt} of memberData.membership) {
      if (!exitableAt) {
        rest.push({
          pubkey: clan,
          isSigner: false,
          isWritable: true,
        });
        rest.push({
          pubkey: this.sdk.clan.voterWeightAddress(clan)[0],
          isSigner: false,
          isWritable: true,
        });
      }
    }

    return await this.sdk.program.methods
      .updateVoterWeight()
      .accountsStrict({
        root: memberData.root,
        member: memberAddress,
        memberVwr: memberData.voterWeightRecord,
        maxVwr: this.sdk.root.maxVoterWieghtAddress({
          rootAddress: memberData.root,
        })[0],
      })
      .remainingAccounts(rest)
      .instruction();
  }

  async setVoterWeightRecordInstruction({
    memberData,
    memberAddress,
    memberAuthority = memberData.owner,
    memberVwr,
  }: {
    memberData: {
      root: PublicKey;
      owner: PublicKey;
      membership: MembershipEntry[];
    };
    memberAddress?: PublicKey;
    memberAuthority?: PublicKey;
    memberVwr: PublicKey;
  }) {
    if (!memberAddress) {
      [memberAddress] = this.memberAddress({
        rootAddress: memberData.root,
        owner: memberData.owner,
      });
    }

    const rest: AccountMeta[] = [];
    for (const {clan, exitableAt} of memberData.membership) {
      if (!exitableAt) {
        rest.push({
          pubkey: clan,
          isSigner: false,
          isWritable: true,
        });
        rest.push({
          pubkey: this.sdk.clan.voterWeightAddress(clan)[0],
          isSigner: false,
          isWritable: true,
        });
      }
    }

    return await this.sdk.program.methods
      .setVoterWeightRecord()
      .accountsStrict({
        root: memberData.root,
        member: memberAddress,
        memberAuthority,
        memberVwr,
        maxVwr: this.sdk.root.maxVoterWieghtAddress({
          rootAddress: memberData.root,
        })[0],
      })
      .remainingAccounts(rest)
      .instruction();
  }
}
