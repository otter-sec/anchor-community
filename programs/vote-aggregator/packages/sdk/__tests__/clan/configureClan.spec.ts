import {
  ConfigureClanTestData,
  configureClanTestData,
} from 'vote-aggregator-tests';
import {Keypair} from '@solana/web3.js';
import {VoteAggregatorSdk} from '../../src';

describe('Configure clan instructions', () => {
  it.each(
    configureClanTestData.filter(
      ({error, newDelegate}) => !error && newDelegate !== undefined
    )
  )(
    'Sets the delegate',
    async ({clan, clanAuthority, newDelegate}: ConfigureClanTestData) => {
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

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanDelegateInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          delegate: newDelegate!,
        })
      ).resolves.toMatchSnapshot();
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newName}) => !error && newName !== undefined
    )
  )(
    'Sets the name',
    async ({clan, clanAuthority, newName}: ConfigureClanTestData) => {
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

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanNameInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          name: newName!,
        })
      ).resolves.toMatchSnapshot();
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newDescription}) => !error && newDescription !== undefined
    )
  )(
    'Sets the description',
    async ({clan, clanAuthority, newDescription}: ConfigureClanTestData) => {
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

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanDescriptionInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          description: newDescription!,
        })
      ).resolves.toMatchSnapshot();
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newMinVotingWeightToJoin}) =>
        !error && newMinVotingWeightToJoin !== undefined
    )
  )(
    'Sets the MinVotingWeightToJoin',
    async ({
      clan,
      clanAuthority,
      newMinVotingWeightToJoin,
    }: ConfigureClanTestData) => {
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

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanMinVotingWeightToJoinInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          minVotingWeightToJoin: newMinVotingWeightToJoin!,
        })
      ).resolves.toMatchSnapshot();
    }
  );

  it.each(
    configureClanTestData.filter(
      ({error, newAcceptTemporaryMembers}) =>
        !error && newAcceptTemporaryMembers !== undefined
    )
  )(
    'Sets the AcceptTemporaryMembers',
    async ({
      clan,
      clanAuthority,
      newAcceptTemporaryMembers,
    }: ConfigureClanTestData) => {
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

      const sdk = new VoteAggregatorSdk();
      expect(
        sdk.clan.setClanAcceptTemporaryMembersInstruction({
          clanAddress: clan.address,
          clanAuthority: clanAuthority.publicKey,
          acceptTemporaryMembers: newAcceptTemporaryMembers!,
        })
      ).resolves.toMatchSnapshot();
    }
  );
});
