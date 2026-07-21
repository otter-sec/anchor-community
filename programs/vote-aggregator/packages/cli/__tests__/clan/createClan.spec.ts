import {startTest} from '../../dev/startTest';
import {PublicKey} from '@solana/web3.js';
import {
  CreateClanTestData,
  RealmTester,
  RootTester,
  createClanTestData,
} from 'vote-aggregator-tests';
import {BN} from '@coral-xyz/anchor';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {
  GovernanceAccountType,
  getTokenOwnerRecord,
} from '@solana/spl-governance';
import { RootAccount } from 'vote-aggregator-sdk';

describe('create-clan command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(createClanTestData.filter(({error}) => !error))(
    'Works',
    async ({realm, root, clan}: CreateClanTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const {provider} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await rootTester.realm.accounts()),
          ...(await rootTester.accounts()),
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
              'create-clan',
              '--realm',
              rootTester.realm.realmAddress.toString(),
              '--side',
              root.side,
              '--clan',
              '[' + clan.address.secretKey.toString() + ']',
              '--owner',
              clan.owner.toString(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      const [voterAuthority, voterAuthorityBump] = sdk.clan.voterAuthority({
        clanAddress: clan.address.publicKey,
      });
      const [tokenOwnerRecord, tokenOwnerRecordBump] =
        sdk.clan.tokenOwnerRecordAddress({
          realmAddress: rootTester.realm.realmAddress,
          governingTokenMint: rootTester.governingTokenMint,
          clanAddress: clan.address.publicKey,
          splGovernanceId: rootTester.splGovernanceId,
        });
      const [voterWeightRecord, voterWeightRecordBump] =
        sdk.clan.voterWeightAddress(clan.address.publicKey);

      await expect(
        sdk.clan.fetchClan(clan.address.publicKey)
      ).resolves.toStrictEqual({
        root: rootTester.rootAddress[0],
        owner: clan.owner,
        delegate: PublicKey.default,
        voterAuthority,
        tokenOwnerRecord,
        voterWeightRecord,
        minVotingWeightToJoin: new BN(0),
        bumps: {
          voterAuthority: voterAuthorityBump,
          tokenOwnerRecord: tokenOwnerRecordBump,
          voterWeightRecord: voterWeightRecordBump,
        },
        permanentMembers: new BN(0),
        temporaryMembers: new BN(0),
        updatedTemporaryMembers: new BN(0),
        leavingMembers: new BN(0),
        permanentVoterWeight: new BN(0),
        nextVoterWeightResetTime:
          rootTester.root.voterWeightReset?.nextResetTime || null,
        acceptTemporaryMembers: true,
        name: '',
        description: '',
      });

      await expect(
        getTokenOwnerRecord(provider.connection, tokenOwnerRecord).then(
          ({account}) => account
        )
      ).resolves.toMatchObject({
        realm: rootTester.realm.realmAddress,
        governingTokenMint: rootTester.governingTokenMint,
        governingTokenOwner: voterAuthority,
        governingTokenDepositAmount: new BN(0),
        unrelinquishedVotesCount: 0,
        outstandingProposalCount: 0,
        version: 1,
        accountType: GovernanceAccountType.TokenOwnerRecordV1,
        governanceDelegate: undefined,
        totalVotesCount: 0,
        reserved: new Uint8Array(6),
      });

      await expect(
        sdk.clan.fetchVoterWeight({voterWeightAddress: voterWeightRecord})
      ).resolves.toStrictEqual({
        realm: rootTester.realm.realmAddress,
        governingTokenMint: rootTester.governingTokenMint,
        governingTokenOwner: voterAuthority,
        voterWeight: new BN(0),
        voterWeightExpiry: null,
        weightAction: null,
        weightActionTarget: null,
        reserved: [0, 0, 0, 0, 0, 0, 0, 0],
      });

      await expect(
        sdk.root.fetchRoot(rootTester.rootAddress[0])
      ).resolves.toStrictEqual<RootAccount>({
        ...rootTester.root,
        clanCount: rootTester.root.clanCount.addn(1),
      });
    }
  );
});
