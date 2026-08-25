import {startTest} from '../../dev/startTest';
import {
  StartLeavingClanTestData,
  RealmTester,
  parseLogsEvent,
  startLeavingClanTestData,
} from '../../src';
import {ClanTester, MemberTester, RootTester} from '../../src/VoteAggregator';
import {BN} from '@coral-xyz/anchor';
import {Keypair} from '@solana/web3.js';

describe('start_leaving_clan instruction', () => {
  it.each(startLeavingClanTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, member, clanIndex = 0}: StartLeavingClanTestData) => {
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
      const clanTester = memberTester.membership[clanIndex].clan;
      if (!(clanTester instanceof ClanTester)) {
        throw new Error(`Clan #${clanIndex} must be provided`);
      }
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await memberTester.accounts()),
          ...(await clanTester.accounts()),
        ],
      });

      const tx = await program.methods
        .startLeavingClan()
        .accountsStrict({
          root: rootTester.rootAddress[0],
          member: memberTester.memberAddress[0],
          clan: clanTester.clanAddress,
          memberAuthority: memberTester.ownerAddress,
          clanVwr: clanTester.voterWeightAddress[0],
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, member.owner as Keypair);

      const time = (await testContext.banksClient.getClock()).unixTimestamp;
      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'ClanVoterWeightChanged',
          data: {
            clan: clanTester.clanAddress,
            newVoterWeight: clanTester.voterWeightRecord.voterWeight.sub(
              memberTester.member.voterWeight
            ),
            oldVoterWeight: clanTester.voterWeightRecord.voterWeight,
            oldPermamentVoterWeight: clanTester.clan.permanentVoterWeight,
            newPermamentVoterWeight: clanTester.clan.permanentVoterWeight.sub(
              memberTester.member.voterWeight
            ),
            oldIsPermanent: true,
            newIsPermanent: true,
            root: rootTester.rootAddress[0],
          },
        },
        {
          name: 'StartingLeavingClan',
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
        membership: memberTester.member.membership.map((m, index) => {
          if (index === clanIndex) {
            m.exitableAt = new BN(time.toString()).add(
              rootTester.root.maxProposalLifetime
            );
          }
          return m;
        }),
      });

      await expect(
        program.account.clan.fetch(clanTester.clanAddress)
      ).resolves.toStrictEqual({
        ...clanTester.clan,
        permanentMembers: clanTester.clan.permanentMembers.subn(1),
        leavingMembers: clanTester.clan.leavingMembers.addn(1),
        permanentVoterWeight: clanTester.clan.permanentVoterWeight.sub(
          memberTester.member.voterWeight
        ),
      });

      await expect(
        program.account.voterWeightRecord.fetch(
          clanTester.voterWeightAddress[0]
        )
      ).resolves.toStrictEqual({
        ...clanTester.voterWeightRecord,
        voterWeight: clanTester.voterWeightRecord.voterWeight.sub(
          memberTester.member.voterWeight
        ),
      });
    }
  );
});
