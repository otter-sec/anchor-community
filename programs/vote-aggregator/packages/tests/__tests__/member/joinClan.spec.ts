import {startTest} from '../../dev/startTest';
import {
  JoinClanTestData,
  RealmTester,
  parseLogsEvent,
  joinClanTestData,
  buildSplGovernanceProgram,
} from '../../src';
import {ClanTester, MemberTester, RootTester} from '../../src/VoteAggregator';
import {AccountMeta, Keypair, PublicKey, SystemProgram} from '@solana/web3.js';

describe('join_clan instruction', () => {
  it.each(joinClanTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      memberVoterWeight,
      clan,
      shareBp = 10000,
    }: JoinClanTestData) => {
      const tokenConfig =
        (root.side === 'community'
          ? realm.communityTokenConfig
          : realm.councilTokenConfig) || {};
      const voteAggregatorId =
        root.voteAggregatorId ||
        new PublicKey('VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT');
      const [rootAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('root', 'utf-8'),
          realm.realmAddress.toBuffer(),
          root.side === 'community'
            ? realm.communityMint.toBuffer()
            : realm.councilMint!.toBuffer(),
        ],
        voteAggregatorId
      );
      const lockAuthority = PublicKey.findProgramAddressSync(
        [Buffer.from('lock-authority', 'utf8'), rootAddress.toBuffer()],
        voteAggregatorId
      )[0];
      if (tokenConfig.lockAuthorities === undefined) {
        tokenConfig.lockAuthorities = [lockAuthority];
      }
      if (root.side === 'community') {
        realm.communityTokenConfig = tokenConfig;
      } else {
        realm.councilTokenConfig = tokenConfig;
      }

      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const memberTester = new MemberTester({
        ...member,
        root: rootTester,
        membership: MemberTester.membershipTesters({
          membership: member.membership || [],
          root: rootTester,
        }),
      });

      const oldClanTesters = memberTester.membership.flatMap(
        ({clan, exitableAt}) => {
          if (exitableAt) {
            return [];
          }

          if (clan instanceof PublicKey) {
            throw new Error('Clan data should be provided');
          }

          return [clan];
        }
      );

      const clanTester = new ClanTester({...clan, root: rootTester});
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await memberTester.accounts()),
          ...(
            await Promise.all(oldClanTesters.map(clan => clan.accounts()))
          ).flat(),
          ...(await clanTester.accounts()),
          await realmTester.voterWeightRecord({
            ...memberVoterWeight,
            side: root.side,
            owner: memberTester.ownerAddress,
          }),
        ],
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: rootTester.splGovernanceId,
        connection: program.provider.connection,
      });

      const rest: AccountMeta[] = [];
      for (const clanTester of oldClanTesters) {
        rest.push(
          {
            pubkey: clanTester.clanAddress,
            isWritable: true,
            isSigner: false,
          },
          {
            pubkey: clanTester.voterWeightAddress[0],
            isWritable: true,
            isSigner: false,
          }
        );
      }

      const tx = await program.methods
        .joinClan(shareBp)
        .accountsStrict({
          root: rootTester.rootAddress[0],
          member: memberTester.memberAddress[0],
          clan: clan.address,
          memberAuthority: memberTester.ownerAddress,
          clanVwr: clanTester.voterWeightAddress[0],
          memberTor: memberTester.tokenOwnerRecordAddress[0],
          memberVwr: memberVoterWeight.address,
          maxVwr: rootTester.maxVoterWeightAddress[0],
          realm: realmTester.realmAddress,
          realmConfig: await realmTester.realmConfigId(),
          lockAuthority: rootTester.lockAuthority[0],
          payer: program.provider.publicKey!,
          governanceProgram: rootTester.splGovernanceId,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(rest)
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, member.owner as Keypair);

      const oldClanUpdateEvents = oldClanTesters.map(clanTester => ({
        name: 'ClanVoterWeightChanged',
        data: {
          clan: clanTester.clanAddress,
          newVoterWeight: clanTester.voterWeightRecord.voterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeight.voterWeight),
          oldVoterWeight: clanTester.voterWeightRecord.voterWeight,
          oldPermamentVoterWeight: clanTester.clan.permanentVoterWeight,
          newPermamentVoterWeight: clanTester.clan.permanentVoterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeight.voterWeight),
          oldIsPermanent: true,
          newIsPermanent: true,
          root: rootTester.rootAddress[0],
        },
      }));

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        ...oldClanUpdateEvents,
        {
          name: 'ClanVoterWeightChanged',
          data: {
            clan: clanTester.clanAddress,
            newVoterWeight: clanTester.voterWeightRecord.voterWeight.add(
              memberVoterWeight.voterWeight
            ),
            oldVoterWeight: clanTester.voterWeightRecord.voterWeight,
            oldPermamentVoterWeight: clanTester.clan.permanentVoterWeight,
            newPermamentVoterWeight: clanTester.clan.permanentVoterWeight.add(
              memberVoterWeight.voterWeight
            ),
            oldIsPermanent: true,
            newIsPermanent: true,
            root: rootTester.rootAddress[0],
          },
        },
        {
          name: 'MemberVoterWeightChanged',
          data: {
            member: memberTester.memberAddress[0],
            newVoterWeight: memberVoterWeight.voterWeight,
            oldVoterWeight: memberTester.member.voterWeight,
            oldVoterWeightRecord: memberTester.member.voterWeightRecord,
            newVoterWeightRecord: memberVoterWeight.address,
            root: rootTester.rootAddress[0],
          },
        },
        {
          name: 'MaxVoterWeightChanged',
          data: {
            newMaxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight.add(
              memberVoterWeight.voterWeight
            ),
            oldMaxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight,
            root: rootTester.rootAddress[0],
          },
        },
        {
          name: 'ClanMemberAdded',
          data: {
            clan: clanTester.clanAddress,
            member: memberTester.memberAddress[0],
            owner: memberTester.ownerAddress,
            root: rootTester.rootAddress[0],
          },
        },
      ]);

      await expect(
        program.account.member.fetch(memberTester.memberAddress[0])
      ).resolves.toStrictEqual({
        ...memberTester.member,
        membership: memberTester.membership.concat({
          clan: clanTester.clanAddress,
          shareBp,
          exitableAt: null,
        }),
        voterWeightRecord: memberVoterWeight.address,
        voterWeight: memberVoterWeight.voterWeight,
        voterWeightExpiry: memberVoterWeight.voterWeightExpiry || null,
      });

      await expect(
        program.account.clan.fetch(clanTester.clanAddress)
      ).resolves.toStrictEqual({
        ...clanTester.clan,
        permanentVoterWeight: clanTester.clan.permanentVoterWeight.add(
          memberVoterWeight.voterWeight
        ),
        permanentMembers: clanTester.clan.permanentMembers.addn(1),
      });

      await expect(
        program.account.voterWeightRecord.fetch(
          clanTester.voterWeightAddress[0]
        )
      ).resolves.toStrictEqual({
        ...clanTester.voterWeightRecord,
        voterWeight: clanTester.voterWeightRecord.voterWeight.add(
          memberVoterWeight.voterWeight
        ),
      });

      await expect(
        program.account.maxVoterWeightRecord.fetch(
          rootTester.maxVoterWeightAddress[0]
        )
      ).resolves.toMatchObject({
        ...rootTester.maxVoterWeight,
        maxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight.add(
          memberVoterWeight.voterWeight
        ),
      });

      await expect(
        splGovernance.account.tokenOwnerRecordV2.fetch(
          memberTester.tokenOwnerRecordAddress[0]
        )
      ).resolves.toStrictEqual({
        ...memberTester.tokenOwnerRecord,
        locks: [
          {
            lockType: 0,
            expiry: null,
            authority: lockAuthority,
          },
        ],
      });
    }
  );
});
