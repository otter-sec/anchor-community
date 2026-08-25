// @ts-nocheck
import * as B from "@native-to-anchor/buffer-layout";
import { Idl, InstructionCoder } from "@coral-xyz/anchor";

export class SplGovernanceInstructionCoder implements InstructionCoder {
  constructor(_idl: Idl) {}

  encode(ixName: string, ix: any): Buffer {
    switch (ixName) {
      case "createRealm": {
        return encodeCreateRealm(ix);
      }
      case "depositGoverningTokens": {
        return encodeDepositGoverningTokens(ix);
      }
      case "withdrawGoverningTokens": {
        return encodeWithdrawGoverningTokens(ix);
      }
      case "setGovernanceDelegate": {
        return encodeSetGovernanceDelegate(ix);
      }
      case "createGovernance": {
        return encodeCreateGovernance(ix);
      }
      case "createProgramGovernance": {
        return encodeCreateProgramGovernance(ix);
      }
      case "createProposal": {
        return encodeCreateProposal(ix);
      }
      case "addSignatory": {
        return encodeAddSignatory(ix);
      }
      case "insertTransaction": {
        return encodeInsertTransaction(ix);
      }
      case "removeTransaction": {
        return encodeRemoveTransaction(ix);
      }
      case "cancelProposal": {
        return encodeCancelProposal(ix);
      }
      case "signOffProposal": {
        return encodeSignOffProposal(ix);
      }
      case "castVote": {
        return encodeCastVote(ix);
      }
      case "finalizeVote": {
        return encodeFinalizeVote(ix);
      }
      case "relinquishVote": {
        return encodeRelinquishVote(ix);
      }
      case "executeTransaction": {
        return encodeExecuteTransaction(ix);
      }
      case "createMintGovernance": {
        return encodeCreateMintGovernance(ix);
      }
      case "createTokenGovernance": {
        return encodeCreateTokenGovernance(ix);
      }
      case "setGovernanceConfig": {
        return encodeSetGovernanceConfig(ix);
      }
      case "flagTransactionError": {
        return encodeFlagTransactionError(ix);
      }
      case "setRealmAuthority": {
        return encodeSetRealmAuthority(ix);
      }
      case "setRealmConfig": {
        return encodeSetRealmConfig(ix);
      }
      case "createTokenOwnerRecord": {
        return encodeCreateTokenOwnerRecord(ix);
      }
      case "createNativeTreasury": {
        return encodeCreateNativeTreasury(ix);
      }
      case "revokeGoverningTokens": {
        return encodeRevokeGoverningTokens(ix);
      }
      case "refundProposalDeposit": {
        return encodeRefundProposalDeposit(ix);
      }
      case "completeProposal": {
        return encodeCompleteProposal(ix);
      }
      case "addRequiredSignatory": {
        return encodeAddRequiredSignatory(ix);
      }
      case "removeRequiredSignatory": {
        return encodeRemoveRequiredSignatory(ix);
      }
      case "setTokenOwnerRecordLock": {
        return encodeSetTokenOwnerRecordLock(ix);
      }
      case "removeTokenOwnerRecordLock": {
        return encodeRemoveTokenOwnerRecordLock(ix);
      }
      case "setRealmConfigItem": {
        return encodeSetRealmConfigItem(ix);
      }

      default: {
        throw new Error(`Invalid instruction: ${ixName}`);
      }
    }
  }

  encodeState(_ixName: string, _ix: any): Buffer {
    throw new Error("SplGovernance does not have state");
  }
}

function encodeCreateRealm({ name, configArgs }: any): Buffer {
  return encodeData(
    { createRealm: { name, configArgs } },
    1 +
      4 +
      name.length +
      1 +
      8 +
      (() => {
        switch (Object.keys(configArgs.communityMintMaxVoterWeightSource)[0]) {
          case "supplyFraction":
            return 1 + 8;
          case "absolute":
            return 1 + 8;
        }
      })() +
      1 +
      1 +
      (() => {
        switch (Object.keys(configArgs.communityTokenConfigArgs.tokenType)[0]) {
          case "liquid":
            return 1;
          case "membership":
            return 1;
          case "dormant":
            return 1;
        }
      })() +
      1 +
      1 +
      (() => {
        switch (Object.keys(configArgs.councilTokenConfigArgs.tokenType)[0]) {
          case "liquid":
            return 1;
          case "membership":
            return 1;
          case "dormant":
            return 1;
        }
      })()
  );
}

function encodeDepositGoverningTokens({ amount }: any): Buffer {
  return encodeData({ depositGoverningTokens: { amount } }, 1 + 8);
}

function encodeWithdrawGoverningTokens({}: any): Buffer {
  return encodeData({ withdrawGoverningTokens: {} }, 1);
}

function encodeSetGovernanceDelegate({ newGovernanceDelegate }: any): Buffer {
  return encodeData(
    { setGovernanceDelegate: { newGovernanceDelegate } },
    1 + 1 + (newGovernanceDelegate === null ? 0 : 32)
  );
}

function encodeCreateGovernance({ config }: any): Buffer {
  return encodeData(
    { createGovernance: { config } },
    1 +
      (() => {
        switch (Object.keys(config.communityVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      4 +
      4 +
      (() => {
        switch (Object.keys(config.communityVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      (() => {
        switch (Object.keys(config.councilVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.communityVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      4 +
      1
  );
}

function encodeCreateProgramGovernance({
  config,
  transferUpgradeAuthority,
}: any): Buffer {
  return encodeData(
    { createProgramGovernance: { config, transferUpgradeAuthority } },
    1 +
      (() => {
        switch (Object.keys(config.communityVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      4 +
      4 +
      (() => {
        switch (Object.keys(config.communityVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      (() => {
        switch (Object.keys(config.councilVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.communityVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      4 +
      1 +
      1
  );
}

function encodeCreateProposal({
  name,
  descriptionLink,
  voteType,
  options,
  useDenyOption,
  proposalSeed,
}: any): Buffer {
  return encodeData(
    {
      createProposal: {
        name,
        descriptionLink,
        voteType,
        options,
        useDenyOption,
        proposalSeed,
      },
    },
    1 +
      4 +
      name.length +
      4 +
      descriptionLink.length +
      (() => {
        switch (Object.keys(voteType)[0]) {
          case "singleChoice":
            return 1;
          case "multiChoice":
            return (
              1 +
              (() => {
                switch (Object.keys(voteType.multiChoice)[0]) {
                  case "fullWeight":
                    return 1;
                  case "weighted":
                    return 1;
                }
              })() +
              1 +
              1 +
              1
            );
        }
      })() +
      4 +
      options.reduce((a: number, c: any) => a + 4 + c.length, 0) +
      1 +
      32
  );
}

function encodeAddSignatory({ signatory }: any): Buffer {
  return encodeData({ addSignatory: { signatory } }, 1 + 32);
}

function encodeInsertTransaction({
  optionIndex,
  index,
  holdUpTime,
  instructions,
}: any): Buffer {
  return encodeData(
    { insertTransaction: { optionIndex, index, holdUpTime, instructions } },
    1 +
      1 +
      2 +
      4 +
      4 +
      instructions.reduce(
        (a: number, c: any) =>
          a + 32 + 4 + c.accounts.length * 34 + 4 + c.data.length,
        0
      )
  );
}

function encodeRemoveTransaction({}: any): Buffer {
  return encodeData({ removeTransaction: {} }, 1);
}

function encodeCancelProposal({}: any): Buffer {
  return encodeData({ cancelProposal: {} }, 1);
}

function encodeSignOffProposal({}: any): Buffer {
  return encodeData({ signOffProposal: {} }, 1);
}

function encodeCastVote({ vote }: any): Buffer {
  return encodeData(
    { castVote: { vote } },
    1 +
      (() => {
        switch (Object.keys(vote)[0]) {
          case "approve":
            return 1 + 4 + vote.length * 2;
          case "deny":
            return 1;
          case "abstain":
            return 1;
          case "veto":
            return 1;
        }
      })()
  );
}

function encodeFinalizeVote({}: any): Buffer {
  return encodeData({ finalizeVote: {} }, 1);
}

function encodeRelinquishVote({}: any): Buffer {
  return encodeData({ relinquishVote: {} }, 1);
}

function encodeExecuteTransaction({}: any): Buffer {
  return encodeData({ executeTransaction: {} }, 1);
}

function encodeCreateMintGovernance({
  config,
  transferMintAuthorities,
}: any): Buffer {
  return encodeData(
    { createMintGovernance: { config, transferMintAuthorities } },
    1 +
      (() => {
        switch (Object.keys(config.communityVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      4 +
      4 +
      (() => {
        switch (Object.keys(config.communityVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      (() => {
        switch (Object.keys(config.councilVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.communityVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      4 +
      1 +
      1
  );
}

function encodeCreateTokenGovernance({
  config,
  transferAccountAuthorities,
}: any): Buffer {
  return encodeData(
    { createTokenGovernance: { config, transferAccountAuthorities } },
    1 +
      (() => {
        switch (Object.keys(config.communityVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      4 +
      4 +
      (() => {
        switch (Object.keys(config.communityVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      (() => {
        switch (Object.keys(config.councilVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.communityVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      4 +
      1 +
      1
  );
}

function encodeSetGovernanceConfig({ config }: any): Buffer {
  return encodeData(
    { setGovernanceConfig: { config } },
    1 +
      (() => {
        switch (Object.keys(config.communityVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      4 +
      4 +
      (() => {
        switch (Object.keys(config.communityVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.councilVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      8 +
      (() => {
        switch (Object.keys(config.councilVoteTipping)[0]) {
          case "strict":
            return 1;
          case "early":
            return 1;
          case "disabled":
            return 1;
        }
      })() +
      (() => {
        switch (Object.keys(config.communityVetoVoteThreshold)[0]) {
          case "yesVotePercentage":
            return 1 + 1;
          case "quorumPercentage":
            return 1 + 1;
          case "disabled":
            return 1;
        }
      })() +
      4 +
      1
  );
}

function encodeFlagTransactionError({}: any): Buffer {
  return encodeData({ flagTransactionError: {} }, 1);
}

function encodeSetRealmAuthority({ action }: any): Buffer {
  return encodeData(
    { setRealmAuthority: { action } },
    1 +
      (() => {
        switch (Object.keys(action)[0]) {
          case "setUnchecked":
            return 1;
          case "setChecked":
            return 1;
          case "remove":
            return 1;
        }
      })()
  );
}

function encodeSetRealmConfig({ configArgs }: any): Buffer {
  return encodeData(
    { setRealmConfig: { configArgs } },
    1 +
      1 +
      8 +
      (() => {
        switch (Object.keys(configArgs.communityMintMaxVoterWeightSource)[0]) {
          case "supplyFraction":
            return 1 + 8;
          case "absolute":
            return 1 + 8;
        }
      })() +
      1 +
      1 +
      (() => {
        switch (Object.keys(configArgs.communityTokenConfigArgs.tokenType)[0]) {
          case "liquid":
            return 1;
          case "membership":
            return 1;
          case "dormant":
            return 1;
        }
      })() +
      1 +
      1 +
      (() => {
        switch (Object.keys(configArgs.councilTokenConfigArgs.tokenType)[0]) {
          case "liquid":
            return 1;
          case "membership":
            return 1;
          case "dormant":
            return 1;
        }
      })()
  );
}

function encodeCreateTokenOwnerRecord({}: any): Buffer {
  return encodeData({ createTokenOwnerRecord: {} }, 1);
}

function encodeCreateNativeTreasury({}: any): Buffer {
  return encodeData({ createNativeTreasury: {} }, 1);
}

function encodeRevokeGoverningTokens({ amount }: any): Buffer {
  return encodeData({ revokeGoverningTokens: { amount } }, 1 + 8);
}

function encodeRefundProposalDeposit({}: any): Buffer {
  return encodeData({ refundProposalDeposit: {} }, 1);
}

function encodeCompleteProposal({}: any): Buffer {
  return encodeData({ completeProposal: {} }, 1);
}

function encodeAddRequiredSignatory({ signatory }: any): Buffer {
  return encodeData({ addRequiredSignatory: { signatory } }, 1 + 32);
}

function encodeRemoveRequiredSignatory({}: any): Buffer {
  return encodeData({ removeRequiredSignatory: {} }, 1);
}

function encodeSetTokenOwnerRecordLock({ lockType, expiry }: any): Buffer {
  return encodeData(
    { setTokenOwnerRecordLock: { lockType, expiry } },
    1 + 1 + 1 + (expiry === null ? 0 : 8)
  );
}

function encodeRemoveTokenOwnerRecordLock({ lockType }: any): Buffer {
  return encodeData({ removeTokenOwnerRecordLock: { lockType } }, 1 + 1);
}

function encodeSetRealmConfigItem({ args }: any): Buffer {
  return encodeData(
    { setRealmConfigItem: { args } },
    1 +
      (() => {
        switch (Object.keys(args)[0]) {
          case "tokenOwnerRecordLockAuthority":
            return 2 + 32 + 32;
        }
      })()
  );
}

const LAYOUT = B.union(B.u8("instruction"));
LAYOUT.addVariant(
  0,
  B.struct([
    B.utf8Str("name"),
    B.struct(
      [
        B.bool("useCouncilMint"),
        B.u64("minCommunityWeightToCreateGovernance"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u64(), "supplyFraction");
          U.addVariant(1, B.u64(), "absolute");
          return U;
        })("communityMintMaxVoterWeightSource"),
        B.struct(
          [
            B.bool("useVoterWeightAddin"),
            B.bool("useMaxVoterWeightAddin"),
            ((p: string) => {
              const U = B.union(B.u8("discriminator"), null, p);
              U.addVariant(0, B.struct([]), "liquid");
              U.addVariant(1, B.struct([]), "membership");
              U.addVariant(2, B.struct([]), "dormant");
              return U;
            })("tokenType"),
          ],
          "communityTokenConfigArgs"
        ),
        B.struct(
          [
            B.bool("useVoterWeightAddin"),
            B.bool("useMaxVoterWeightAddin"),
            ((p: string) => {
              const U = B.union(B.u8("discriminator"), null, p);
              U.addVariant(0, B.struct([]), "liquid");
              U.addVariant(1, B.struct([]), "membership");
              U.addVariant(2, B.struct([]), "dormant");
              return U;
            })("tokenType"),
          ],
          "councilTokenConfigArgs"
        ),
      ],
      "configArgs"
    ),
  ]),
  "createRealm"
);
LAYOUT.addVariant(1, B.struct([B.u64("amount")]), "depositGoverningTokens");
LAYOUT.addVariant(2, B.struct([]), "withdrawGoverningTokens");
LAYOUT.addVariant(
  3,
  B.struct([B.option(B.publicKey(), "newGovernanceDelegate")]),
  "setGovernanceDelegate"
);
LAYOUT.addVariant(
  4,
  B.struct([
    B.struct(
      [
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteThreshold"),
        B.u64("minCommunityWeightToCreateProposal"),
        B.u32("minTransactionHoldUpTime"),
        B.u32("votingBaseTime"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteThreshold"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVetoVoteThreshold"),
        B.u64("minCouncilWeightToCreateProposal"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVetoVoteThreshold"),
        B.u32("votingCoolOffTime"),
        B.u8("depositExemptProposalCount"),
      ],
      "config"
    ),
  ]),
  "createGovernance"
);
LAYOUT.addVariant(
  5,
  B.struct([
    B.struct(
      [
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteThreshold"),
        B.u64("minCommunityWeightToCreateProposal"),
        B.u32("minTransactionHoldUpTime"),
        B.u32("votingBaseTime"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteThreshold"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVetoVoteThreshold"),
        B.u64("minCouncilWeightToCreateProposal"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVetoVoteThreshold"),
        B.u32("votingCoolOffTime"),
        B.u8("depositExemptProposalCount"),
      ],
      "config"
    ),
    B.bool("transferUpgradeAuthority"),
  ]),
  "createProgramGovernance"
);
LAYOUT.addVariant(
  6,
  B.struct([
    B.utf8Str("name"),
    B.utf8Str("descriptionLink"),
    ((p: string) => {
      const U = B.union(B.u8("discriminator"), null, p);
      U.addVariant(0, B.struct([]), "singleChoice");
      U.addVariant(
        1,
        B.struct([
          ((p: string) => {
            const U = B.union(B.u8("discriminator"), null, p);
            U.addVariant(0, B.struct([]), "fullWeight");
            U.addVariant(1, B.struct([]), "weighted");
            return U;
          })("choiceType"),
          B.u8("minVoterOptions"),
          B.u8("maxVoterOptions"),
          B.u8("maxWinningOptions"),
        ]),
        "multiChoice"
      );
      return U;
    })("voteType"),
    B.vec(B.utf8Str(), "options"),
    B.bool("useDenyOption"),
    B.publicKey("proposalSeed"),
  ]),
  "createProposal"
);
LAYOUT.addVariant(7, B.struct([B.publicKey("signatory")]), "addSignatory");
LAYOUT.addVariant(
  9,
  B.struct([
    B.u8("optionIndex"),
    B.u16("index"),
    B.u32("holdUpTime"),
    B.vec(
      B.struct([
        B.publicKey("programId"),
        B.vec(
          B.struct([
            B.publicKey("pubkey"),
            B.bool("isSigner"),
            B.bool("isWritable"),
          ]),
          "accounts"
        ),
        B.bytes("data"),
      ]),
      "instructions"
    ),
  ]),
  "insertTransaction"
);
LAYOUT.addVariant(10, B.struct([]), "removeTransaction");
LAYOUT.addVariant(11, B.struct([]), "cancelProposal");
LAYOUT.addVariant(12, B.struct([]), "signOffProposal");
LAYOUT.addVariant(
  13,
  B.struct([
    ((p: string) => {
      const U = B.union(B.u8("discriminator"), null, p);
      U.addVariant(
        0,
        B.vec(B.struct([B.u8("rank"), B.u8("weightPercentage")])),
        "approve"
      );
      U.addVariant(1, B.struct([]), "deny");
      U.addVariant(2, B.struct([]), "abstain");
      U.addVariant(3, B.struct([]), "veto");
      return U;
    })("vote"),
  ]),
  "castVote"
);
LAYOUT.addVariant(14, B.struct([]), "finalizeVote");
LAYOUT.addVariant(15, B.struct([]), "relinquishVote");
LAYOUT.addVariant(16, B.struct([]), "executeTransaction");
LAYOUT.addVariant(
  17,
  B.struct([
    B.struct(
      [
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteThreshold"),
        B.u64("minCommunityWeightToCreateProposal"),
        B.u32("minTransactionHoldUpTime"),
        B.u32("votingBaseTime"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteThreshold"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVetoVoteThreshold"),
        B.u64("minCouncilWeightToCreateProposal"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVetoVoteThreshold"),
        B.u32("votingCoolOffTime"),
        B.u8("depositExemptProposalCount"),
      ],
      "config"
    ),
    B.bool("transferMintAuthorities"),
  ]),
  "createMintGovernance"
);
LAYOUT.addVariant(
  18,
  B.struct([
    B.struct(
      [
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteThreshold"),
        B.u64("minCommunityWeightToCreateProposal"),
        B.u32("minTransactionHoldUpTime"),
        B.u32("votingBaseTime"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteThreshold"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVetoVoteThreshold"),
        B.u64("minCouncilWeightToCreateProposal"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVetoVoteThreshold"),
        B.u32("votingCoolOffTime"),
        B.u8("depositExemptProposalCount"),
      ],
      "config"
    ),
    B.bool("transferAccountAuthorities"),
  ]),
  "createTokenGovernance"
);
LAYOUT.addVariant(
  19,
  B.struct([
    B.struct(
      [
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteThreshold"),
        B.u64("minCommunityWeightToCreateProposal"),
        B.u32("minTransactionHoldUpTime"),
        B.u32("votingBaseTime"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteThreshold"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVetoVoteThreshold"),
        B.u64("minCouncilWeightToCreateProposal"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.struct([]), "strict");
          U.addVariant(1, B.struct([]), "early");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("councilVoteTipping"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u8(), "yesVotePercentage");
          U.addVariant(1, B.u8(), "quorumPercentage");
          U.addVariant(2, B.struct([]), "disabled");
          return U;
        })("communityVetoVoteThreshold"),
        B.u32("votingCoolOffTime"),
        B.u8("depositExemptProposalCount"),
      ],
      "config"
    ),
  ]),
  "setGovernanceConfig"
);
LAYOUT.addVariant(20, B.struct([]), "flagTransactionError");
LAYOUT.addVariant(
  21,
  B.struct([
    ((p: string) => {
      const U = B.union(B.u8("discriminator"), null, p);
      U.addVariant(0, B.struct([]), "setUnchecked");
      U.addVariant(1, B.struct([]), "setChecked");
      U.addVariant(2, B.struct([]), "remove");
      return U;
    })("action"),
  ]),
  "setRealmAuthority"
);
LAYOUT.addVariant(
  22,
  B.struct([
    B.struct(
      [
        B.bool("useCouncilMint"),
        B.u64("minCommunityWeightToCreateGovernance"),
        ((p: string) => {
          const U = B.union(B.u8("discriminator"), null, p);
          U.addVariant(0, B.u64(), "supplyFraction");
          U.addVariant(1, B.u64(), "absolute");
          return U;
        })("communityMintMaxVoterWeightSource"),
        B.struct(
          [
            B.bool("useVoterWeightAddin"),
            B.bool("useMaxVoterWeightAddin"),
            ((p: string) => {
              const U = B.union(B.u8("discriminator"), null, p);
              U.addVariant(0, B.struct([]), "liquid");
              U.addVariant(1, B.struct([]), "membership");
              U.addVariant(2, B.struct([]), "dormant");
              return U;
            })("tokenType"),
          ],
          "communityTokenConfigArgs"
        ),
        B.struct(
          [
            B.bool("useVoterWeightAddin"),
            B.bool("useMaxVoterWeightAddin"),
            ((p: string) => {
              const U = B.union(B.u8("discriminator"), null, p);
              U.addVariant(0, B.struct([]), "liquid");
              U.addVariant(1, B.struct([]), "membership");
              U.addVariant(2, B.struct([]), "dormant");
              return U;
            })("tokenType"),
          ],
          "councilTokenConfigArgs"
        ),
      ],
      "configArgs"
    ),
  ]),
  "setRealmConfig"
);
LAYOUT.addVariant(23, B.struct([]), "createTokenOwnerRecord");
LAYOUT.addVariant(24, B.struct([]), "updateProgramMetadata");
LAYOUT.addVariant(25, B.struct([]), "createNativeTreasury");
LAYOUT.addVariant(26, B.struct([B.u64("amount")]), "revokeGoverningTokens");
LAYOUT.addVariant(27, B.struct([]), "refundProposalDeposit");
LAYOUT.addVariant(28, B.struct([]), "completeProposal");
LAYOUT.addVariant(
  29,
  B.struct([B.publicKey("signatory")]),
  "addRequiredSignatory"
);
LAYOUT.addVariant(30, B.struct([]), "removeRequiredSignatory");
LAYOUT.addVariant(
  31,
  B.struct([B.u8("lockType"), B.option(B.i64(), "expiry")]),
  "setTokenOwnerRecordLock"
);
LAYOUT.addVariant(
  32,
  B.struct([B.u8("lockType")]),
  "removeTokenOwnerRecordLock"
);
LAYOUT.addVariant(
  33,
  B.struct([
    ((p: string) => {
      const U = B.union(B.u8("discriminator"), null, p);
      U.addVariant(
        0,
        B.struct([
          B.u8("action"),
          B.publicKey("governingTokenMint"),
          B.publicKey("authority"),
        ]),
        "tokenOwnerRecordLockAuthority"
      );
      return U;
    })("args"),
  ]),
  "setRealmConfigItem"
);

function encodeData(ix: any, span: number): Buffer {
  const b = Buffer.alloc(span);
  LAYOUT.encode(ix, b);
  return b;
}
