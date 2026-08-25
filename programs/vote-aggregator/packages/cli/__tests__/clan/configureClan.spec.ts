import {startTest} from '../../dev/startTest';
import {
  configureClanTestData,
  setClanOwnerTestData,
  ClanTester,
  ConfigureClanTestData,
  SetClanOwnerTestData,
} from 'vote-aggregator-tests';
import {context} from '../../src/context';
import {cli} from '../../src/cli';
import {Keypair, PublicKey} from '@solana/web3.js';

describe('configure-clan command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(
    configureClanTestData.filter(
      ({error, newDelegate}) => !error && newDelegate !== undefined
    )
  )(
    'It the clan delegate',
    async ({clan, clanAuthority, newDelegate}: ConfigureClanTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              ...(newDelegate!.equals(PublicKey.default)
                ? ['--reset-delegate']
                : ['--set-delegate', newDelegate!.toBase58()]),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        delegate: newDelegate!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newName}) => !error && newName !== undefined
    )
  )(
    'It sets clan name',
    async ({clan, clanAuthority, newName}: ConfigureClanTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              '--set-name',
              newName!,
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        name: newName!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newDescription}) => !error && newDescription !== undefined
    )
  )(
    'It sets clan description',
    async ({clan, clanAuthority, newDescription}: ConfigureClanTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              '--set-description',
              newDescription!,
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        description: newDescription!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newMinVotingWeightToJoin}) =>
        !error && newMinVotingWeightToJoin !== undefined
    )
  )(
    'It sets clan MinVotingWeightToJoin',
    async ({
      clan,
      clanAuthority,
      newMinVotingWeightToJoin,
    }: ConfigureClanTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              '--set-min-voting-weight-to-join',
              newMinVotingWeightToJoin!.toString(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        minVotingWeightToJoin: newMinVotingWeightToJoin!,
      });
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newAcceptTemporaryMembers}) =>
        !error && newAcceptTemporaryMembers !== undefined
    )
  )(
    'It sets clan AcceptTemporaryMembers',
    async ({
      clan,
      clanAuthority,
      newAcceptTemporaryMembers,
    }: ConfigureClanTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      } else if (clanAuthority === 'delegate') {
        if (!(clan.delegate instanceof Keypair)) {
          throw new Error('Clan delegate is not a keypair');
        }
        clanAuthority = clan.delegate;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              newAcceptTemporaryMembers
                ? '--set-accept-temporary-members'
                : '--set-reject-temporary-members',
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        acceptTemporaryMembers: newAcceptTemporaryMembers!,
      });
    }
  );

  it.each(setClanOwnerTestData.filter(({error}) => !error))(
    'It sets clan owner',
    async ({clan, clanAuthority, newOwner}: SetClanOwnerTestData) => {
      const clanAccount = ClanTester.clanAccount(clan);
      await startTest({
        splGovernanceId: new PublicKey(
          'BdhNf6wxdcDudYT4KD4uft3nvJah1LNx7QzGKMuGoSgX'
        ), // some dummy key
        accounts: [
          await ClanTester.encodeClanAccount({
            address: clan.address,
            clan: clanAccount,
            size: clan.size,
            voteAggregatorId: new PublicKey(
              'VoTaGDreyne7jk59uwbgRRbaAzxvNbyNipaJMrRXhjT'
            ),
          }),
        ],
      });

      if (clanAuthority === 'owner') {
        if (!(clan.owner instanceof Keypair)) {
          throw new Error('Clan owner is not a keypair');
        }
        clanAuthority = clan.owner;
      }
      const {sdk} = context!;

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'configure-clan',
              '--clan',
              clan.address.toBase58(),
              '--authority',
              '[' + clanAuthority.secretKey.toString() + ']',
              '--set-owner',
              newOwner.toBase58(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      await expect(sdk.clan.fetchClan(clan.address)).resolves.toStrictEqual({
        ...clanAccount,
        owner: newOwner,
      });
    }
  );
});
