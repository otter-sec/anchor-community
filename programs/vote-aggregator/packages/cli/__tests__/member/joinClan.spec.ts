import {startTest} from '../../dev/startTest';
import {
  JoinClanTestData,
  RealmTester,
  RootTester,
  joinClanTestData,
  MemberTester,
  ClanTester,
  buildSplGovernanceProgram,
} from 'vote-aggregator-tests';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('join-clan command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(joinClanTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      member,
      memberVoterWeight,
      shareBp,
      clan,
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
      const {provider} = await startTest({
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
              'join-clan',
              '--owner',
              '[' + (memberTester.owner as Keypair).secretKey.toString() + ']',
              '--member-voter-weight',
              memberVoterWeight.address.toBase58(),
              '--clan',
              clanTester.clanAddress.toBase58(),
              ...(shareBp !== undefined ? ['--share', shareBp.toString()] : []),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      await expect(
        sdk.member.fetchMember({memberAddress: memberTester.memberAddress[0]})
      ).resolves.toStrictEqual({
        ...memberTester.member,
        membership: memberTester.membership.concat({
          clan: clanTester.clanAddress,
          shareBp:
            shareBp ||
            10000 -
              memberTester.membership.reduce((a, {shareBp: b}) => a + b, 0),
          exitableAt: null,
        }),
        voterWeightRecord: memberVoterWeight.address,
        voterWeight: memberVoterWeight.voterWeight,
        voterWeightExpiry: memberVoterWeight.voterWeightExpiry || null,
      });

      await expect(
        sdk.clan.fetchClan(clanTester.clanAddress)
      ).resolves.toStrictEqual({
        ...clanTester.clan,
        permanentVoterWeight: clanTester.clan.permanentVoterWeight.add(
          memberVoterWeight.voterWeight
        ),
        permanentMembers: clanTester.clan.permanentMembers.addn(1),
      });

      await expect(
        sdk.clan.fetchVoterWeight({
          clanAddress: clanTester.clanAddress,
        })
      ).resolves.toStrictEqual({
        ...clanTester.voterWeightRecord,
        voterWeight: clanTester.voterWeightRecord.voterWeight.add(
          memberVoterWeight.voterWeight
        ),
      });

      await expect(
        sdk.root.fetchMaxVoterWeight({rootAddress: rootTester.rootAddress[0]})
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
