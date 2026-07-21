import {startTest} from '../../dev/startTest';
import {
  ForcedCancelProposalTestData,
  RealmTester,
  parseLogsEvent,
  forcedCancelProposalTestData,
  buildSplGovernanceProgram,
} from '../../src';
import {ClanTester, RootTester} from '../../src/VoteAggregator';
import {PublicKey} from '@solana/web3.js';
import {GovernanceTester} from '../../src/SplGovernance/governance';
import {ProposalTester} from '../../src/SplGovernance';
import {SYSTEM_PROGRAM_ID} from '@solana/spl-governance';

describe('forced_cancel_proposal instruction', () => {
  it.each(forcedCancelProposalTestData.filter(({error}) => !error))(
    'Works',
    async ({
      realm,
      root,
      clan,
      governance,
      proposal,
    }: ForcedCancelProposalTestData) => {
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
      const {testContext, program} = await startTest({
        splGovernanceId: rootTester.splGovernanceId,
        accounts: [
          ...(await realmTester.accounts()),
          ...(await rootTester.accounts()),
          ...(await clanTester.accounts()),
          await governanceTester.account(),
          await proposalTester.account(),
        ],
      });
      const splGovernance = buildSplGovernanceProgram({
        splGovernanceId: rootTester.splGovernanceId,
        connection: program.provider.connection,
      });

      const [voterAuthority] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter-authority', 'utf-8'),
          clanTester.clanAddress.toBuffer(),
        ],
        program.programId
      );
      const [clanTor] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('governance', 'utf-8'),
          rootTester.realm.realmAddress.toBuffer(),
          rootTester.governingTokenMint.toBuffer(),
          voterAuthority.toBuffer(),
        ],
        rootTester.splGovernanceId
      );

      const tx = await program.methods
        .forcedCancelProposal()
        .accountsStrict({
          root: rootTester.rootAddress[0],
          clan: clanTester.clanAddress,
          governanceProgram: rootTester.splGovernanceId,
          voterAuthority,
          clanTor,
          realm: realmTester.realmAddress,
          realmConfig: await realmTester.realmConfigId(),
          governingTokenMint: proposalTester.proposal.governingTokenMint,
          systemProgram: SYSTEM_PROGRAM_ID,
          governance: governanceTester.governanceAddress,
          proposal: proposalTester.proposalAddress,
          clanVwr: clanTester.voterWeightAddress[0],
        })
        .transaction();
      tx.recentBlockhash = testContext.lastBlockhash;
      tx.feePayer = testContext.payer.publicKey;
      tx.sign(testContext.payer);

      await expect(
        testContext.banksClient
          .processTransaction(tx)
          .then(meta => parseLogsEvent(program, meta.logMessages))
      ).resolves.toStrictEqual([
        {
          name: 'ProposalCanceled',
          data: {
            clan: clanTester.clanAddress,
            proposal: proposalTester.proposalAddress,
          },
        },
      ]);

      await expect(
        splGovernance.account.proposalV2.fetch(proposalTester.proposalAddress)
      ).resolves.toMatchObject({
        state: {
          cancelled: {},
        },
      });
    }
  );
});
