import {startTest} from '../../dev/startTest';
import {
  ExitClanTestData,
  RealmTester,
  RootTester,
  exitClanTestData,
  MemberTester,
  ClanTester,
  buildSplGovernanceProgram,
} from 'vote-aggregator-tests';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {BN} from '@coral-xyz/anchor';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('exit-clan command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

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
      const {provider} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await memberTester.accounts()),
          ...(await clanTester.accounts()),
        ],
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: realmTester.splGovernanceId,
        connection: provider.connection,
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'exit-clan',
              '--realm',
              rootTester.realm.realmAddress.toString(),
              '--side',
              rootTester.side,
              '--owner',
              '[' + (memberTester.owner as Keypair).secretKey.toString() + ']',
              '--clan',
              clanTester.clanAddress.toString(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      const newMembership = [...memberTester.member.membership];
      newMembership.splice(clanIndex, 1);
      await expect(
        sdk.member.fetchMember({memberAddress: memberTester.memberAddress[0]})
      ).resolves.toStrictEqual({
        ...memberTester.member,
        membership: newMembership,
      });

      await expect(
        sdk.clan.fetchClan(clanTester.clanAddress)
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
