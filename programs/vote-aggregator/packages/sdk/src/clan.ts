import {
  GetProgramAccountsFilter,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {VoteAggregatorSdk} from './sdk';
import {IdlAccounts, ProgramAccount} from '@coral-xyz/anchor';
import {VoteAggregator} from './vote_aggregator';
import {
  SYSTEM_PROGRAM_ID,
  TokenOwnerRecord,
  getRealmConfigAddress,
  getTokenOwnerRecord,
  getVoteRecordAddress,
} from '@solana/spl-governance';
import BN from 'bn.js';

export type ClanAccount = IdlAccounts<VoteAggregator>['clan'];
export type VoterWeightAccount =
  IdlAccounts<VoteAggregator>['voterWeightRecord'];

export class ClanSdk {
  constructor(public readonly sdk: VoteAggregatorSdk) {}

  voterAuthority({clanAddress}: {clanAddress: PublicKey}): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('voter-authority', 'utf-8'), clanAddress.toBuffer()],
      this.sdk.programId
    );
  }

  tokenOwnerRecordAddress({
    realmAddress,
    governingTokenMint,
    clanAddress,
    voterAuthority,
    splGovernanceId,
  }: {
    realmAddress: PublicKey;
    governingTokenMint: PublicKey;
    clanAddress?: PublicKey;
    voterAuthority?: PublicKey;
    splGovernanceId: PublicKey;
  }): [PublicKey, number] {
    if (!voterAuthority) {
      if (!clanAddress) {
        throw new Error('clanAddress is required');
      }
      voterAuthority = this.voterAuthority({clanAddress})[0];
    }
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance', 'utf-8'),
        realmAddress.toBuffer(),
        governingTokenMint.toBuffer(),
        voterAuthority.toBuffer(),
      ],
      splGovernanceId
    );
  }

  voterWeightAddress(clanAddress: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('voter-weight', 'utf-8'), clanAddress.toBuffer()],
      this.sdk.programId
    );
  }

  fetchClan(clanAddress: PublicKey): Promise<ClanAccount> {
    return this.sdk.program.account.clan.fetch(clanAddress);
  }

  fetchClans({
    root,
    owner,
    delegate,
    voterAuthority,
    tokenOwnerRecord,
    voterWeightRecord,
  }: {
    root?: PublicKey;
    owner?: PublicKey;
    delegate?: PublicKey;
    voterAuthority?: PublicKey;
    tokenOwnerRecord?: PublicKey;
    voterWeightRecord?: PublicKey;
  }): Promise<ProgramAccount<ClanAccount>[]> {
    let filter: GetProgramAccountsFilter[] | undefined;

    if (root) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 8,
          bytes: root.toBase58(),
        },
      });
    }

    if (owner) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 40,
          bytes: owner.toBase58(),
        },
      });
    }

    if (delegate) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 72,
          bytes: delegate.toBase58(),
        },
      });
    }

    if (voterAuthority) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 104,
          bytes: voterAuthority.toBase58(),
        },
      });
    }

    if (tokenOwnerRecord) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 136,
          bytes: tokenOwnerRecord.toBase58(),
        },
      });
    }

    if (voterWeightRecord) {
      if (!filter) {
        filter = [];
      }
      filter.push({
        memcmp: {
          offset: 168,
          bytes: voterWeightRecord.toBase58(),
        },
      });
    }

    return this.sdk.program.account.clan.all(filter);
  }

  fetchVoterWeight({
    clanAddress,
    voterWeightAddress,
  }: {
    clanAddress?: PublicKey;
    voterWeightAddress?: PublicKey;
  }): Promise<VoterWeightAccount> {
    if (!voterWeightAddress) {
      if (!clanAddress) {
        throw new Error('clanAddress is required');
      }
      voterWeightAddress = this.voterWeightAddress(clanAddress)[0];
    }
    return this.sdk.program.account.voterWeightRecord.fetch(voterWeightAddress);
  }

  async fetchTokenOwnerRecord({
    rootData,
    clanAddress,
  }: {
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    clanAddress: PublicKey;
  }): Promise<ProgramAccount<TokenOwnerRecord>> {
    const [publicKey] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      clanAddress,
      splGovernanceId: rootData.governanceProgram,
    });
    const {account} = await getTokenOwnerRecord(this.sdk.connection, publicKey);
    return {
      publicKey,
      account,
    };
  }

  async createClanInstruction({
    rootAddress,
    rootData,
    clanAddress,
    owner,
    payer = owner,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    clanAddress: PublicKey;
    owner: PublicKey;
    payer?: PublicKey;
  }) {
    const [voterAuthority] = this.voterAuthority({clanAddress});
    const [clanTor] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      clanAddress,
      splGovernanceId: rootData.governanceProgram,
    });
    const [clanVwr] = this.voterWeightAddress(clanAddress);
    return await this.sdk.program.methods
      .createClan(owner)
      .accountsStrict({
        root: rootAddress,
        clan: clanAddress,
        realm: rootData.realm,
        governingTokenMint: rootData.governingTokenMint,
        payer,
        governanceProgram: rootData.governanceProgram,
        systemProgram: SystemProgram.programId,
        voterAuthority,
        clanTor,
        clanVwr,
      })
      .instruction();
  }

  async setClanOwnerInstruction({
    clanAddress,
    owner,
    newOwner,
  }: {
    clanAddress: PublicKey;
    owner: PublicKey;
    newOwner: PublicKey;
  }) {
    return await this.sdk.program.methods
      .setClanOwner(newOwner)
      .accountsStrict({
        clan: clanAddress,
        owner,
      })
      .instruction();
  }

  async resizeClanInstruction({
    clanAddress,
    clanAuthority,
    payer,
    size,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    payer: PublicKey;
    size: number;
  }) {
    return await this.sdk.program.methods
      .resizeClan(size)
      .accountsStrict({
        clan: clanAddress,
        payer,
        systemProgram: SYSTEM_PROGRAM_ID,
        clanAuthority,
      })
      .instruction();
  }

  async setClanDelegateInstruction({
    clanAddress,
    clanAuthority,
    delegate,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    delegate: PublicKey;
  }) {
    return await this.sdk.program.methods
      .setClanDelegate(delegate)
      .accountsStrict({
        clan: clanAddress,
        clanAuthority,
      })
      .instruction();
  }

  async setClanNameInstruction({
    clanAddress,
    clanAuthority,
    name,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    name: string;
  }) {
    return await this.sdk.program.methods
      .setClanName(name)
      .accountsStrict({
        clan: clanAddress,
        clanAuthority,
      })
      .instruction();
  }

  async setClanDescriptionInstruction({
    clanAddress,
    clanAuthority,
    description,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    description: string;
  }) {
    return await this.sdk.program.methods
      .setClanDescription(description)
      .accountsStrict({
        clan: clanAddress,
        clanAuthority,
      })
      .instruction();
  }

  async setClanMinVotingWeightToJoinInstruction({
    clanAddress,
    clanAuthority,
    minVotingWeightToJoin,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    minVotingWeightToJoin: BN;
  }) {
    return await this.sdk.program.methods
      .setClanMinVotingWeightToJoin(minVotingWeightToJoin)
      .accountsStrict({
        clan: clanAddress,
        clanAuthority,
      })
      .instruction();
  }

  async setClanAcceptTemporaryMembersInstruction({
    clanAddress,
    clanAuthority,
    acceptTemporaryMembers,
  }: {
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    acceptTemporaryMembers: boolean;
  }) {
    return await this.sdk.program.methods
      .setClanAcceptTemporaryMembers(acceptTemporaryMembers)
      .accountsStrict({
        clan: clanAddress,
        clanAuthority,
      })
      .instruction();
  }

  async setVotingDelegateInstruction({
    rootAddress,
    rootData,
    clanAddress,
    clanAuthority,
    newVotingDelegate,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    clanAddress: PublicKey;
    clanAuthority: PublicKey;
    newVotingDelegate: PublicKey | null;
  }) {
    const [voterAuthority] = this.voterAuthority({clanAddress});
    const [clanTor] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      clanAddress,
      splGovernanceId: rootData.governanceProgram,
    });
    return await this.sdk.program.methods
      .setVotingDelegate(newVotingDelegate || PublicKey.default)
      .accountsStrict({
        root: rootAddress,
        clan: clanAddress,
        governanceProgram: rootData.governanceProgram,
        voterAuthority,
        clanTor,
        clanAuthority,
      })
      .instruction();
  }

  async forcedCancelProposalInstruction({
    rootAddress,
    rootData,
    governance,
    proposal,
    clanAddress,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    governance: PublicKey;
    proposal: PublicKey;
    clanAddress: PublicKey;
  }) {
    const [voterAuthority] = this.voterAuthority({clanAddress});
    const [clanTor] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      clanAddress,
      splGovernanceId: rootData.governanceProgram,
    });
    return await this.sdk.program.methods
      .forcedCancelProposal()
      .accountsStrict({
        root: rootAddress,
        clan: clanAddress,
        governanceProgram: rootData.governanceProgram,
        voterAuthority,
        clanTor,
        realm: rootData.realm,
        realmConfig: await getRealmConfigAddress(
          rootData.governanceProgram,
          rootData.realm
        ),
        governingTokenMint: rootData.governingTokenMint,
        systemProgram: SYSTEM_PROGRAM_ID,
        governance,
        proposal,
        clanVwr: this.sdk.clan.voterWeightAddress(clanAddress)[0],
      })
      .instruction();
  }

  async udpateProposalVote({
    rootAddress,
    rootData,
    governance,
    proposal,
    proposalOwnerRecord,
    maxVwr = null,
    clanAddress,
    payer,
  }: {
    rootAddress: PublicKey;
    rootData: {
      governanceProgram: PublicKey;
      realm: PublicKey;
      governingTokenMint: PublicKey;
    };
    governance: PublicKey;
    proposal: PublicKey;
    proposalOwnerRecord: PublicKey;
    maxVwr?: PublicKey | null;
    clanAddress: PublicKey;
    payer: PublicKey;
  }) {
    const [voterAuthority] = this.voterAuthority({clanAddress});
    const [clanTor] = this.tokenOwnerRecordAddress({
      realmAddress: rootData.realm,
      governingTokenMint: rootData.governingTokenMint,
      clanAddress,
      splGovernanceId: rootData.governanceProgram,
    });
    return await this.sdk.program.methods
      .updateProposalVote()
      .accountsStrict({
        root: rootAddress,
        clan: clanAddress,
        governanceProgram: rootData.governanceProgram,
        voterAuthority,
        clanTor,
        realm: rootData.realm,
        realmConfig: await getRealmConfigAddress(
          rootData.governanceProgram,
          rootData.realm
        ),
        governingTokenMint: rootData.governingTokenMint,
        systemProgram: SYSTEM_PROGRAM_ID,
        governance,
        proposal,
        clanVwr: this.sdk.clan.voterWeightAddress(clanAddress)[0],
        maxVwr,
        proposalOwnerRecord,
        voteRecord: await getVoteRecordAddress(
          rootData.governanceProgram,
          proposal,
          this.sdk.clan.tokenOwnerRecordAddress({
            realmAddress: rootData.realm,
            governingTokenMint: rootData.governingTokenMint,
            clanAddress,
            splGovernanceId: rootData.governanceProgram,
          })[0]
        ),
        payer,
      })
      .instruction();
  }
}
