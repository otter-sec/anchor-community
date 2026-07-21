import {startTest} from '../../dev/startTest';
import {
  exitClanTestData,
  RealmTester,
  parseLogsEvent,
  ExitClanTestData,
  buildSplGovernanceProgram,
} from '../../src';
import {ClanTester, MemberTester, RootTester} from '../../src/VoteAggregator';
import {BN} from '@coral-xyz/anchor';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('exit_clan instruction', () => {
  it.each(exitClanTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      clanIndex = 0,
      clanLeavingTimeOffset,
    }: ExitClanTestData) => {
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
      if (tokenConfig.lockAuthorities === undefined) {
        tokenConfig.lockAuthorities = [
          PublicKey.findProgramAddressSync(
            [Buffer.from('lock-authority', 'utf8'), rootAddress.toBuffer()],
            voteAggregatorId
          )[0],
        ];
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
      if (member.locks === undefined) {
        member.locks = [
          {
            lockType: 0,
            authority: rootTester.lockAuthority[0],
            expiry: null,
          },
        ];
      }
      const currentTime = new BN(Math.floor(Date.now() / 1000));
      const membership = MemberTester.membershipTesters({
        membership: member.membership || [],
        root: rootTester,
      });
      membership[clanIndex].exitableAt ||= currentTime.add(
        clanLeavingTimeOffset!
      );
      const memberTester = new MemberTester({
        ...member,
        root: rootTester,
        membership,
      });
      const clanTester = membership[clanIndex].clan;
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
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: rootTester.splGovernanceId,
        connection: program.provider.connection,
      });

      const tx = await program.methods
        .exitClan()
        .accountsStrict({
          root: rootTester.rootAddress[0],
          member: memberTester.memberAddress[0],
          clan: clanTester.clanAddress,
          memberAuthority: memberTester.ownerAddress,
          governanceProgram: rootTester.splGovernanceId,
          lockAuthority: rootTester.lockAuthority[0],
          memberTor: memberTester.tokenOwnerRecordAddress[0],
          clanTor: null,
          realm: realmTester.realmAddress,
          realmConfig: await realmTester.realmConfigId(),
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer, member.owner as Keypair);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'ClanMemberLeft',
          data: {
            clan: clanTester.clanAddress,
            member: memberTester.memberAddress[0],
            owner: memberTester.ownerAddress,
            root: rootTester.rootAddress[0],
          },
        },
      ]);

      const newMembership = [...memberTester.member.membership];
      newMembership.splice(clanIndex, 1);
      await expect(
        program.account.member.fetch(memberTester.memberAddress[0])
      ).resolves.toStrictEqual({
        ...memberTester.member,
        membership: newMembership,
      });

      await expect(
        program.account.clan.fetch(clanTester.clanAddress)
      ).resolves.toStrictEqual({
        ...clanTester.clan,
        leavingMembers: clanTester.clan.leavingMembers.subn(1),
      });

      await expect(
        splGovernance.account.tokenOwnerRecordV2.fetch(
          memberTester.tokenOwnerRecordAddress[0]
        )
      ).resolves.toStrictEqual({
        ...memberTester.tokenOwnerRecord,
        locks:
          newMembership.length > 0 ? memberTester.tokenOwnerRecord.locks : [],
      });
    }
  );
});
