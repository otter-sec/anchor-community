import {startTest} from '../../dev/startTest';
import {
  UpdateProposalVoteTestData,
  RealmTester,
  RootTester,
  updateProposalVoteTestData,
  ClanTester,
} from 'vote-aggregator-tests';
import {cli} from '../../src/cli';
import {getProposal, getVoteRecord} from '@solana/spl-governance';
import {
  GovernanceTester,
  ProposalTester,
  VoteTester,
} from 'vote-aggregator-tests';

describe('update-proposal-vote command', () => {
  let stdout: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    stdout.mockRestore();
  });

  it.each(updateProposalVoteTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      governance,
      proposal,
      vote,
    }: UpdateProposalVoteTestData) => {
      const realmTester = new RealmTester(realm);
      const rootTester = new RootTester({
        ...root,
        realm: realmTester,
      });
      const clanTester = new ClanTester({...clan, root: rootTester});
      const governanceTester = new GovernanceTester({
        ...governance,
        realm: realmTester,
      });
      const proposalTester = new ProposalTester({
        ...proposal,
        governance: governanceTester,
        clan: proposal.owner ? undefined : clanTester,
      });
      const voteTester = new VoteTester({
        ...vote,
        proposal: proposalTester,
        clan: vote.owner ? undefined : clanTester,
      });
      const {provider} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await clanTester.accounts()),
          await governanceTester.account(),
          await proposalTester.account(),
          await voteTester.account(),
          await realmTester.tokenOwnerRecord({
            owner: proposalTester.owner,
            governingTokenMint: proposalTester.proposal.governingTokenMint,
          }),
        ],
      });

      await expect(
        cli()
          .exitOverride((err: Error) => {
            throw err;
          })
          .parseAsync(
            [
              'update-proposal-vote',
              '--clan',
              clanTester.clanAddress.toBase58(),
              '--proposal',
              proposalTester.proposalAddress.toBase58(),
            ],
            {from: 'user'}
          )
      ).resolves.toBeTruthy();
      expect(stdout.mock.calls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringMatching(/^Success/)]),
        ])
      );
      stdout.mockRestore();

      await expect(
        getVoteRecord(provider.connection, await voteTester.voteAddress()).then(
          ({account}) => account
        )
      ).resolves.toMatchObject({
        voterWeight: clanTester.voterWeightRecord.voterWeight,
      });
      await expect(
        getProposal(provider.connection, proposalTester.proposalAddress).then(
          ({account}) => account.options[0].voteWeight
        )
      ).resolves.toStrictEqual(
        proposalTester.proposal.options[0].voteWeight
          .sub(voteTester.vote.voterWeight)
          .add(clanTester.voterWeightRecord.voterWeight)
      );
    }
  );
});
