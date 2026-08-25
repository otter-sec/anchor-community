import {startTest} from '../../dev/startTest';
import {
  SetVotingDelegateTestData,
  RealmTester,
  RootTester,
  setVotingDelegateTestData,
  ClanTester,
} from 'vote-aggregator-tests';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {Keypair} from '@solana/web3.js';
import {getTokenOwnerRecord} from '@solana/spl-governance';

describe('set-voting-delegate command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(setVotingDelegateTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      clanAuthority,
      newVotingDelegate,
    }: SetVotingDelegateTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const clanTester = new ClanTester({...clan, root: rootTester});
      const {provider} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await clanTester.accounts()),
        ],
      });
      if (clanAuthority === 'owner') {
        if (!(clanTester.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clanTester.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clanTester.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clanTester.delegate;
      }

      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'set-voting-delegate',
              '--clan',
              clanTester.clanAddress.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              ...(newVotingDelegate
                ? ['--new-voting-delegate', newVotingDelegate.toBase58()]
                : []),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );

      const [tokenOwnerRecord] = sdk.clan.tokenOwnerRecordAddress({
        realmAddress: rootTester.realm.realmAddress,
        governingTokenMint: rootTester.governingTokenMint,
        clanAddress: clanTester.clanAddress,
        splGovernanceId: rootTester.splGovernanceId,
      });

      await expect(
        getTokenOwnerRecord(provider.connection, tokenOwnerRecord).then(
          ({account}) => account
        )
      ).resolves.toMatchObject({
        governanceDelegate: newVotingDelegate,
      });
    }
  );
});
