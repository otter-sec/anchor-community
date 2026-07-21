import {startTest} from '../../dev/startTest';
import {
  UpdateVoterWeightTestData,
  RealmTester,
  parseLogsEvent,
  updateVoterWeightTestData,
} from '../../src';
import {MemberTester, RootTester} from '../../src/VoteAggregator';
import {AccountMeta, Keypair, PublicKey} from '@solana/web3.js';
//import BN from 'bn.js';

describe('update_voter_weight instruction', () => {
  it.each(updateVoterWeightTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      memberVoterWeightRecord,
    }: UpdateVoterWeightTestData) => {
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

      const clanTesters = memberTester.membership.flatMap(
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

      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await memberTester.accounts()),
          ...(
            await Promise.all(clanTesters.map(clan => clan.accounts()))
          ).flat(),
          await realmTester.voterWeightRecord({
            ...memberVoterWeightRecord,
            side: root.side,
            owner:
              member.owner instanceof Keypair
                ? member.owner.publicKey
                : member.owner,
          }),
        ],
      });

      const rest: AccountMeta[] = [];
      for (const clanTester of clanTesters) {
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
        .updateVoterWeight()
        .accountsStrict({
          root: rootTester.rootAddress[0],
          member: memberTester.memberAddress[0],
          maxVwr: rootTester.maxVoterWeightAddress[0],
          memberVwr: memberVoterWeightRecord.address,
        })
        .remainingAccounts(rest)
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer);

      const clanUpdateEvents = clanTesters.map(clanTester => ({
        name: 'ClanVoterWeightChanged',
        data: {
          clan: clanTester.clanAddress,
          newVoterWeight: clanTester.voterWeightRecord.voterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeightRecord.voterWeight),
          oldVoterWeight: clanTester.voterWeightRecord.voterWeight,
          oldPermamentVoterWeight: clanTester.clan.permanentVoterWeight,
          newPermamentVoterWeight: clanTester.clan.permanentVoterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeightRecord.voterWeight),
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
        ...clanUpdateEvents,
        {
          name: 'MemberVoterWeightChanged',
          data: {
            member: memberTester.memberAddress[0],
            oldVoterWeight: memberTester.member.voterWeight,
            newVoterWeight: memberVoterWeightRecord.voterWeight,
            oldVoterWeightRecord: memberTester.member.voterWeightRecord,
            newVoterWeightRecord: memberTester.member.voterWeightRecord,
            root: rootTester.rootAddress[0],
          },
        },
        {
          name: 'MaxVoterWeightChanged',
          data: {
            root: rootTester.rootAddress[0],
            oldMaxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight,
            newMaxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight
              .sub(memberTester.member.voterWeight)
              .add(memberVoterWeightRecord.voterWeight),
          },
        },
      ]);

      await expect(
        program.account.member.fetch(memberTester.memberAddress[0])
      ).resolves.toStrictEqual({
        ...memberTester.member,
        voterWeight: memberVoterWeightRecord.voterWeight,
        voterWeightExpiry: memberVoterWeightRecord.voterWeightExpiry || null,
      });

      await expect(
        program.account.maxVoterWeightRecord.fetch(
          rootTester.maxVoterWeightAddress[0]
        )
      ).resolves.toMatchObject({
        ...rootTester.maxVoterWeight,
        maxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight
          .sub(memberTester.member.voterWeight)
          .add(memberVoterWeightRecord.voterWeight),
      });

      for (const clanTester of clanTesters) {
        await expect(
          program.account.clan.fetch(clanTester.clanAddress)
        ).resolves.toStrictEqual({
          ...clanTester.clan,
          permanentVoterWeight: clanTester.clan.permanentVoterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeightRecord.voterWeight),
        });

        await expect(
          program.account.voterWeightRecord.fetch(
            clanTester.voterWeightAddress[0]
          )
        ).resolves.toStrictEqual({
          ...clanTester.voterWeightRecord,
          voterWeight: clanTester.voterWeightRecord.voterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeightRecord.voterWeight),
        });
      }
    }
  );
});
