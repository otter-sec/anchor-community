import {startTest} from '../../dev/startTest';
import {
  UpdateVoterWeightTestData,
  RealmTester,
  RootTester,
  updateVoterWeightTestData,
  MemberTester,
} from 'vote-aggregator-tests';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {PublicKey} from '@solana/web3.js';

describe('update-voter-weight command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

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

      await startTest({
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
            owner: memberTester.ownerAddress,
          }),
        ],
      });
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'update-voter-weight',
              '--realm',
              rootTester.realm.realmAddress.toString(),
              '--side',
              rootTester.side,
              '--owner',
              memberTester.ownerAddress.toBase58(),
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
        voterWeightRecord: memberVoterWeightRecord.address,
        voterWeight: memberVoterWeightRecord.voterWeight,
        voterWeightExpiry: memberVoterWeightRecord.voterWeightExpiry || null,
      });

      await expect(
        sdk.root.fetchMaxVoterWeight({rootAddress: rootTester.rootAddress[0]})
      ).resolves.toMatchObject({
        ...rootTester.maxVoterWeight,
        maxVoterWeight: rootTester.maxVoterWeight.maxVoterWeight
          .sub(memberTester.member.voterWeight)
          .add(memberVoterWeightRecord.voterWeight),
      });

      for (const clanTester of clanTesters) {
        await expect(
          sdk.clan.fetchClan(clanTester.clanAddress)
        ).resolves.toStrictEqual({
          ...clanTester.clan,
          permanentVoterWeight: clanTester.clan.permanentVoterWeight
            .sub(memberTester.member.voterWeight)
            .add(memberVoterWeightRecord.voterWeight),
        });

        await expect(
          sdk.clan.fetchVoterWeight({
            clanAddress: clanTester.clanAddress,
          })
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
