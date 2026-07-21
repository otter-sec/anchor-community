export type VoteAggregator = {
  "version": "0.1.0",
  "name": "vote_aggregator",
  "instructions": [
    {
      "name": "createRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Either the realm community mint or the council mint."
          ]
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voteAggregatorProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxProposalLifetime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setMaxProposalLifetime",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMaxProposalLifetime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setVoterWeightReset",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newStep",
          "type": "u64"
        },
        {
          "name": "newNextResetTime",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "resume",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "setVoterWeightPlugin",
      "accounts": [
        {
          "name": "configureRoot",
          "accounts": [
            {
              "name": "root",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "realm",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "realmAuthority",
              "isMut": false,
              "isSigner": true
            }
          ]
        },
        {
          "name": "maxVwr",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newVotingWeightPlugin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createClan",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voter weight record is the account that will be shown to spl-governance",
            "to prove how much vote weight the voter has. See update_voter_weight_record."
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateClan",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanWvr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setClanOwner",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "resizeClan",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "size",
          "type": "u32"
        }
      ]
    },
    {
      "name": "setClanDelegate",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newDelegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setClanName",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "setClanDescription",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "setClanMinVotingWeightToJoin",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "minVotingWeightToJoin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setClanAcceptTemporaryMembers",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "acceptTemporaryMembers",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateProposalVote",
      "accounts": [
        {
          "name": "clan",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposalOwnerRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "forcedCancelProposal",
      "accounts": [
        {
          "name": "clan",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMember",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "memberTor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "joinClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shareBp",
          "type": "u16"
        }
      ]
    },
    {
      "name": "startLeavingClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "exitClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "memberTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lockAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": []
    },
    {
      "name": "setVotingDelegate",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newVotingDelegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateVoterWeight",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setVoterWeightRecord",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "voterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "docs": [
              "VoterWeightRecord discriminator sha256(\"account:VoterWeightRecord\")[..8]",
              "added by anchor",
              "The Realm the VoterWeightRecord belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "docs": [
              "Governing Token Mint the VoterWeightRecord is associated with",
              "Note: The addin can take deposits of any tokens and is not restricted to",
              "the community or council tokens only"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "docs": [
              "The owner of the governing token and voter",
              "This is the actual owner (voter) and corresponds to",
              "TokenOwnerRecord.governing_token_owner"
            ],
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "docs": [
              "Voter's weight",
              "The weight of the voter provided by the addin for the given realm,",
              "governing_token_mint and governing_token_owner (voter)"
            ],
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "docs": [
              "The slot when the voting weight expires",
              "It should be set to None if the weight never expires",
              "If the voter weight decays with time, for example for time locked based",
              "weights, then the expiry must be set. As a common pattern Revise",
              "instruction to update the weight should be invoked before governance",
              "instruction within the same transaction and the expiry set to the",
              "current slot to provide up to date weight"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "weightAction",
            "docs": [
              "The governance action the voter's weight pertains to",
              "It allows to provided voter's weight specific to the particular action",
              "the weight is evaluated for. When the action is provided then the",
              "governance program asserts the executing action is the same as specified",
              "by the addin"
            ],
            "type": {
              "option": {
                "defined": "VoterWeightAction"
              }
            }
          },
          {
            "name": "weightActionTarget",
            "docs": [
              "The target the voter's weight  action pertains to",
              "It allows to provided voter's weight specific to the target the weight",
              "is evaluated for. For example when addin supplies weight to vote on a",
              "particular proposal then it must specify the proposal as the action",
              "target. When the target is provided then the governance program",
              "asserts the target is the same as specified by the addin"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future versions"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "clan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "delegate",
            "type": "publicKey"
          },
          {
            "name": "voterAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeightRecord",
            "type": "publicKey"
          },
          {
            "name": "minVotingWeightToJoin",
            "type": "u64"
          },
          {
            "name": "permanentMembers",
            "type": "u64"
          },
          {
            "name": "temporaryMembers",
            "type": "u64"
          },
          {
            "name": "updatedTemporaryMembers",
            "type": "u64"
          },
          {
            "name": "leavingMembers",
            "type": "u64"
          },
          {
            "name": "acceptTemporaryMembers",
            "type": "bool"
          },
          {
            "name": "permanentVoterWeight",
            "type": "u64"
          },
          {
            "name": "nextVoterWeightResetTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "ClanBumps"
            }
          }
        ]
      }
    },
    {
      "name": "maxVoterWeightRecord",
      "docs": [
        "MaxVoterWeightRecord account",
        "The account is used as an api interface to provide max voting power to the",
        "governance program from external addin contracts"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "docs": [
              "The Realm the MaxVoterWeightRecord belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "docs": [
              "Governing Token Mint the MaxVoterWeightRecord is associated with",
              "Note: The addin can take deposits of any tokens and is not restricted to",
              "the community or council tokens only"
            ],
            "type": "publicKey"
          },
          {
            "name": "maxVoterWeight",
            "docs": [
              "Max voter weight",
              "The max voter weight provided by the addin for the given realm and",
              "governing_token_mint"
            ],
            "type": "u64"
          },
          {
            "name": "maxVoterWeightExpiry",
            "docs": [
              "The slot when the max voting weight expires",
              "It should be set to None if the weight never expires",
              "If the max vote weight decays with time, for example for time locked",
              "based weights, then the expiry must be set. As a pattern Revise",
              "instruction to update the max weight should be invoked before governance",
              "instruction within the same transaction and the expiry set to the",
              "current slot to provide up to date weight"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future versions"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "delegate",
            "type": "publicKey"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeightRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "nextVoterWeightResetTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "membership",
            "type": {
              "vec": {
                "defined": "MembershipEntry"
              }
            }
          },
          {
            "name": "bumps",
            "type": {
              "defined": "MemberBumps"
            }
          }
        ]
      }
    },
    {
      "name": "root",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgram",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "votingWeightPlugin",
            "type": "publicKey"
          },
          {
            "name": "maxProposalLifetime",
            "type": "u64"
          },
          {
            "name": "voterWeightReset",
            "type": {
              "option": {
                "defined": "VoterWeightReset"
              }
            }
          },
          {
            "name": "clanCount",
            "type": "u64"
          },
          {
            "name": "memberCount",
            "type": "u64"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "RootBumps"
            }
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ClanBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voterAuthority",
            "type": "u8"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "u8"
          },
          {
            "name": "voterWeightRecord",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MemberBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "u8"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MembershipEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "clan",
            "type": "publicKey"
          },
          {
            "name": "shareBp",
            "type": "u16"
          },
          {
            "name": "exitableAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "VoterWeightReset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nextResetTime",
            "type": "i64"
          },
          {
            "name": "step",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RootBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "u8"
          },
          {
            "name": "maxVoterWeight",
            "type": "u8"
          },
          {
            "name": "lockAuthority",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VoterWeightAction",
      "docs": [
        "The governance action VoterWeight is evaluated for"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CastVote"
          },
          {
            "name": "CommentProposal"
          },
          {
            "name": "CreateGovernance"
          },
          {
            "name": "CreateProposal"
          },
          {
            "name": "SignOffProposal"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ClanCreated",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "clanIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanOwnerChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOwner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanResized",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newSize",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "ClanDelegateChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldDelegate",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newDelegate",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanNameChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldName",
          "type": "string",
          "index": false
        },
        {
          "name": "newName",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ClanDescriptionChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldDescription",
          "type": "string",
          "index": false
        },
        {
          "name": "newDescription",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMinVotingWeightToJoinChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMinVotingWeightToJoin",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMinVotingWeightToJoin",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClanAcceptTemporaryMembersChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldAcceptTemporaryMembers",
          "type": "bool",
          "index": false
        },
        {
          "name": "newAcceptTemporaryMembers",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMemberAdded",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanVoterWeightChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldPermamentVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newPermamentVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldIsPermanent",
          "type": "bool",
          "index": false
        },
        {
          "name": "newIsPermanent",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMemberLeft",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanVotingDelegateChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVotingDelegate",
          "type": {
            "option": "publicKey"
          },
          "index": false
        },
        {
          "name": "oldVotingDelegate",
          "type": {
            "option": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "ProposalVoteUpdated",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVotingWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVotingWeight",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ProposalCanceled",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MemberCreated",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "memberIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MemberVoterWeightChanged",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldVoterWeightRecord",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVoterWeightRecord",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StartingLeavingClan",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RootCreated",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "governanceProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "realm",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "governingTokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "votingWeightPlugin",
          "type": {
            "option": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "MaxVoterWeightChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMaxVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMaxVoterWeight",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MaxProposalLifetimeChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMaxProposalLifetime",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMaxProposalLifetime",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VoterWeightResetChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeightReset",
          "type": {
            "option": {
              "defined": "VoterWeightReset"
            }
          },
          "index": false
        },
        {
          "name": "newVoterWeightReset",
          "type": {
            "option": {
              "defined": "VoterWeightReset"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "Paused",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "Resumed",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VoterWeightPluginChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVotingWeightPlugin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVotingWeightPlugin",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyRealmAuthority",
      "msg": "Realm has no authority. Please create another realm with authority set"
    },
    {
      "code": 6001,
      "name": "WrongRealmAuthority",
      "msg": "Wrong realm authority"
    },
    {
      "code": 6002,
      "name": "WrongMemberAuthority",
      "msg": "Wrong member authority"
    },
    {
      "code": 6003,
      "name": "WrongClanAuthority",
      "msg": "Wrong clan authority"
    },
    {
      "code": 6004,
      "name": "TooLowVotingPower",
      "msg": "Your voting power is not enough to join this clan"
    },
    {
      "code": 6005,
      "name": "TooEarlyToExitClan",
      "msg": "Can not exit clan waiting for the leave time"
    },
    {
      "code": 6006,
      "name": "UnexpectedExitingClan",
      "msg": "Must start leaving clan first"
    },
    {
      "code": 6007,
      "name": "NoNeedToUpdateProposalVote",
      "msg": "Proposal vote has correct weight already"
    },
    {
      "code": 6008,
      "name": "WrongCommunityVoterWeightAddin",
      "msg": "Wrong community voter addin (must be this program ID)"
    },
    {
      "code": 6009,
      "name": "EmptyCommunityVoterWeightAddin",
      "msg": "Must use this program ID as community voter weight addin"
    },
    {
      "code": 6010,
      "name": "WrongMaxCommunityVoterWeightAddin",
      "msg": "Wrong max community voter weight addin (must be this program ID)"
    },
    {
      "code": 6011,
      "name": "EmptyMaxCommunityVoterWeightAddin",
      "msg": "Must use this program ID as max community voter weight addin"
    },
    {
      "code": 6012,
      "name": "WrongCouncilVoterWeightAddin",
      "msg": "Wrong council voter weight addin (must be this program ID)"
    },
    {
      "code": 6013,
      "name": "MustUseCouncilVoterWeightAddin",
      "msg": "Must use this program ID as council voter weight addin"
    },
    {
      "code": 6014,
      "name": "WrongCouncilMaxVoteWeightAddin",
      "msg": "Wrong council max vote weight addin (must be this program ID)"
    },
    {
      "code": 6015,
      "name": "MustUseCouncilMaxVoteWeightAddin",
      "msg": "Must use this program ID as council max vote weight addin"
    },
    {
      "code": 6016,
      "name": "ChangingVoteDelegatedClanOwner",
      "msg": "Reset voting delegate before changing clan owner"
    },
    {
      "code": 6017,
      "name": "ClanIsRequired",
      "msg": "Must provide clan account"
    },
    {
      "code": 6018,
      "name": "ClanVoterWeightRecordIsRequired"
    },
    {
      "code": 6019,
      "name": "VotingWeightRecordIsRequired",
      "msg": "Must provide voting weight record account"
    },
    {
      "code": 6020,
      "name": "MaxVoterWeightIsRequired",
      "msg": "Must provide max voter weight"
    },
    {
      "code": 6021,
      "name": "ClanAuthorityIsRequired",
      "msg": "Must provide clan authority"
    },
    {
      "code": 6022,
      "name": "RerequestingLeavingClan",
      "msg": "Requesting leaving clan when already leaving"
    },
    {
      "code": 6023,
      "name": "CancelingNonExistentLeavingClanRequest",
      "msg": "Canceling leaving clan while not leaving"
    },
    {
      "code": 6024,
      "name": "AlreadyJoinedClan",
      "msg": "Requesting to join a clan while already participating in some clan. Must exit first"
    },
    {
      "code": 6025,
      "name": "MaxMembershipExceeded"
    },
    {
      "code": 6026,
      "name": "InvalidShareBp"
    },
    {
      "code": 6027,
      "name": "UnknownGoverningTokenMint"
    },
    {
      "code": 6028,
      "name": "InvalidCouncilMint"
    },
    {
      "code": 6029,
      "name": "CouncilMintRequired"
    },
    {
      "code": 6030,
      "name": "CouncilTokenHoldingsRequired"
    },
    {
      "code": 6031,
      "name": "CircularPluginChain"
    },
    {
      "code": 6032,
      "name": "VoterWeightExpiryIsNotImplemented"
    },
    {
      "code": 6033,
      "name": "UnexpectedWeightAction"
    },
    {
      "code": 6034,
      "name": "UnexpectedWeightActionTarget"
    },
    {
      "code": 6035,
      "name": "NextInstructionMustBeSetRealmConfig"
    },
    {
      "code": 6036,
      "name": "VoterWeightExpired"
    },
    {
      "code": 6037,
      "name": "TemporaryMembersNotAllowed"
    },
    {
      "code": 6038,
      "name": "TemporaryMembersNotUpdated"
    },
    {
      "code": 6039,
      "name": "UnexpectedClan"
    },
    {
      "code": 6040,
      "name": "MemberHasUnrelinquishedVotes"
    },
    {
      "code": 6041,
      "name": "MemberHasOutstandingProposals"
    },
    {
      "code": 6042,
      "name": "CanNotChangeNextResetTime"
    },
    {
      "code": 6043,
      "name": "InvalidResetStep"
    },
    {
      "code": 6044,
      "name": "InvalidNextResetTime"
    },
    {
      "code": 6045,
      "name": "Paused"
    },
    {
      "code": 6046,
      "name": "MemberVwrRequired"
    },
    {
      "code": 6047,
      "name": "ResetAllVoterWeightsFirst"
    }
  ]
};

export const IDL: VoteAggregator = {
  "version": "0.1.0",
  "name": "vote_aggregator",
  "instructions": [
    {
      "name": "createRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Either the realm community mint or the council mint."
          ]
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voteAggregatorProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxProposalLifetime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setMaxProposalLifetime",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMaxProposalLifetime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setVoterWeightReset",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newStep",
          "type": "u64"
        },
        {
          "name": "newNextResetTime",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "resume",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "setVoterWeightPlugin",
      "accounts": [
        {
          "name": "configureRoot",
          "accounts": [
            {
              "name": "root",
              "isMut": true,
              "isSigner": false
            },
            {
              "name": "realm",
              "isMut": false,
              "isSigner": false
            },
            {
              "name": "realmAuthority",
              "isMut": false,
              "isSigner": true
            }
          ]
        },
        {
          "name": "maxVwr",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newVotingWeightPlugin",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createClan",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The voter weight record is the account that will be shown to spl-governance",
            "to prove how much vote weight the voter has. See update_voter_weight_record."
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateClan",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanWvr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setClanOwner",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "resizeClan",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "size",
          "type": "u32"
        }
      ]
    },
    {
      "name": "setClanDelegate",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newDelegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setClanName",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "setClanDescription",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "setClanMinVotingWeightToJoin",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "minVotingWeightToJoin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setClanAcceptTemporaryMembers",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "acceptTemporaryMembers",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateProposalVote",
      "accounts": [
        {
          "name": "clan",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposalOwnerRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "forcedCancelProposal",
      "accounts": [
        {
          "name": "clan",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governance",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createMember",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "memberTor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "joinClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shareBp",
          "type": "u16"
        }
      ]
    },
    {
      "name": "startLeavingClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanVwr",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "exitClan",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "memberTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "realmConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lockAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        }
      ],
      "args": []
    },
    {
      "name": "setVotingDelegate",
      "accounts": [
        {
          "name": "clan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clanAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "root",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voterAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clanTor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "governanceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newVotingDelegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateVoterWeight",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setVoterWeightRecord",
      "accounts": [
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "memberVwr",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "maxVwr",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "voterWeightRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "docs": [
              "VoterWeightRecord discriminator sha256(\"account:VoterWeightRecord\")[..8]",
              "added by anchor",
              "The Realm the VoterWeightRecord belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "docs": [
              "Governing Token Mint the VoterWeightRecord is associated with",
              "Note: The addin can take deposits of any tokens and is not restricted to",
              "the community or council tokens only"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenOwner",
            "docs": [
              "The owner of the governing token and voter",
              "This is the actual owner (voter) and corresponds to",
              "TokenOwnerRecord.governing_token_owner"
            ],
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "docs": [
              "Voter's weight",
              "The weight of the voter provided by the addin for the given realm,",
              "governing_token_mint and governing_token_owner (voter)"
            ],
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "docs": [
              "The slot when the voting weight expires",
              "It should be set to None if the weight never expires",
              "If the voter weight decays with time, for example for time locked based",
              "weights, then the expiry must be set. As a common pattern Revise",
              "instruction to update the weight should be invoked before governance",
              "instruction within the same transaction and the expiry set to the",
              "current slot to provide up to date weight"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "weightAction",
            "docs": [
              "The governance action the voter's weight pertains to",
              "It allows to provided voter's weight specific to the particular action",
              "the weight is evaluated for. When the action is provided then the",
              "governance program asserts the executing action is the same as specified",
              "by the addin"
            ],
            "type": {
              "option": {
                "defined": "VoterWeightAction"
              }
            }
          },
          {
            "name": "weightActionTarget",
            "docs": [
              "The target the voter's weight  action pertains to",
              "It allows to provided voter's weight specific to the target the weight",
              "is evaluated for. For example when addin supplies weight to vote on a",
              "particular proposal then it must specify the proposal as the action",
              "target. When the target is provided then the governance program",
              "asserts the target is the same as specified by the addin"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future versions"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "clan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "delegate",
            "type": "publicKey"
          },
          {
            "name": "voterAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeightRecord",
            "type": "publicKey"
          },
          {
            "name": "minVotingWeightToJoin",
            "type": "u64"
          },
          {
            "name": "permanentMembers",
            "type": "u64"
          },
          {
            "name": "temporaryMembers",
            "type": "u64"
          },
          {
            "name": "updatedTemporaryMembers",
            "type": "u64"
          },
          {
            "name": "leavingMembers",
            "type": "u64"
          },
          {
            "name": "acceptTemporaryMembers",
            "type": "bool"
          },
          {
            "name": "permanentVoterWeight",
            "type": "u64"
          },
          {
            "name": "nextVoterWeightResetTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "ClanBumps"
            }
          }
        ]
      }
    },
    {
      "name": "maxVoterWeightRecord",
      "docs": [
        "MaxVoterWeightRecord account",
        "The account is used as an api interface to provide max voting power to the",
        "governance program from external addin contracts"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "realm",
            "docs": [
              "The Realm the MaxVoterWeightRecord belongs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "docs": [
              "Governing Token Mint the MaxVoterWeightRecord is associated with",
              "Note: The addin can take deposits of any tokens and is not restricted to",
              "the community or council tokens only"
            ],
            "type": "publicKey"
          },
          {
            "name": "maxVoterWeight",
            "docs": [
              "Max voter weight",
              "The max voter weight provided by the addin for the given realm and",
              "governing_token_mint"
            ],
            "type": "u64"
          },
          {
            "name": "maxVoterWeightExpiry",
            "docs": [
              "The slot when the max voting weight expires",
              "It should be set to None if the weight never expires",
              "If the max vote weight decays with time, for example for time locked",
              "based weights, then the expiry must be set. As a pattern Revise",
              "instruction to update the max weight should be invoked before governance",
              "instruction within the same transaction and the expiry set to the",
              "current slot to provide up to date weight"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future versions"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "delegate",
            "type": "publicKey"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeightRecord",
            "type": "publicKey"
          },
          {
            "name": "voterWeight",
            "type": "u64"
          },
          {
            "name": "voterWeightExpiry",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "nextVoterWeightResetTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "membership",
            "type": {
              "vec": {
                "defined": "MembershipEntry"
              }
            }
          },
          {
            "name": "bumps",
            "type": {
              "defined": "MemberBumps"
            }
          }
        ]
      }
    },
    {
      "name": "root",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "governanceProgram",
            "type": "publicKey"
          },
          {
            "name": "realm",
            "type": "publicKey"
          },
          {
            "name": "governingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "votingWeightPlugin",
            "type": "publicKey"
          },
          {
            "name": "maxProposalLifetime",
            "type": "u64"
          },
          {
            "name": "voterWeightReset",
            "type": {
              "option": {
                "defined": "VoterWeightReset"
              }
            }
          },
          {
            "name": "clanCount",
            "type": "u64"
          },
          {
            "name": "memberCount",
            "type": "u64"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "RootBumps"
            }
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ClanBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voterAuthority",
            "type": "u8"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "u8"
          },
          {
            "name": "voterWeightRecord",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MemberBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "u8"
          },
          {
            "name": "tokenOwnerRecord",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MembershipEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "clan",
            "type": "publicKey"
          },
          {
            "name": "shareBp",
            "type": "u16"
          },
          {
            "name": "exitableAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "VoterWeightReset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nextResetTime",
            "type": "i64"
          },
          {
            "name": "step",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RootBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": "u8"
          },
          {
            "name": "maxVoterWeight",
            "type": "u8"
          },
          {
            "name": "lockAuthority",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VoterWeightAction",
      "docs": [
        "The governance action VoterWeight is evaluated for"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CastVote"
          },
          {
            "name": "CommentProposal"
          },
          {
            "name": "CreateGovernance"
          },
          {
            "name": "CreateProposal"
          },
          {
            "name": "SignOffProposal"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "ClanCreated",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "clanIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanOwnerChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOwner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanResized",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newSize",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "ClanDelegateChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldDelegate",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newDelegate",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanNameChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldName",
          "type": "string",
          "index": false
        },
        {
          "name": "newName",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ClanDescriptionChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldDescription",
          "type": "string",
          "index": false
        },
        {
          "name": "newDescription",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMinVotingWeightToJoinChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMinVotingWeightToJoin",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMinVotingWeightToJoin",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClanAcceptTemporaryMembersChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldAcceptTemporaryMembers",
          "type": "bool",
          "index": false
        },
        {
          "name": "newAcceptTemporaryMembers",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMemberAdded",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanVoterWeightChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldPermamentVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newPermamentVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldIsPermanent",
          "type": "bool",
          "index": false
        },
        {
          "name": "newIsPermanent",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ClanMemberLeft",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClanVotingDelegateChanged",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVotingDelegate",
          "type": {
            "option": "publicKey"
          },
          "index": false
        },
        {
          "name": "oldVotingDelegate",
          "type": {
            "option": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "ProposalVoteUpdated",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVotingWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVotingWeight",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ProposalCanceled",
      "fields": [
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MemberCreated",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "memberIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MemberVoterWeightChanged",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldVoterWeightRecord",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVoterWeightRecord",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StartingLeavingClan",
      "fields": [
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "clan",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RootCreated",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "governanceProgram",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "realm",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "governingTokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "votingWeightPlugin",
          "type": {
            "option": "publicKey"
          },
          "index": false
        }
      ]
    },
    {
      "name": "MaxVoterWeightChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMaxVoterWeight",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMaxVoterWeight",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MaxProposalLifetimeChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldMaxProposalLifetime",
          "type": "u64",
          "index": false
        },
        {
          "name": "newMaxProposalLifetime",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "VoterWeightResetChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVoterWeightReset",
          "type": {
            "option": {
              "defined": "VoterWeightReset"
            }
          },
          "index": false
        },
        {
          "name": "newVoterWeightReset",
          "type": {
            "option": {
              "defined": "VoterWeightReset"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "Paused",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "Resumed",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VoterWeightPluginChanged",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldVotingWeightPlugin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVotingWeightPlugin",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyRealmAuthority",
      "msg": "Realm has no authority. Please create another realm with authority set"
    },
    {
      "code": 6001,
      "name": "WrongRealmAuthority",
      "msg": "Wrong realm authority"
    },
    {
      "code": 6002,
      "name": "WrongMemberAuthority",
      "msg": "Wrong member authority"
    },
    {
      "code": 6003,
      "name": "WrongClanAuthority",
      "msg": "Wrong clan authority"
    },
    {
      "code": 6004,
      "name": "TooLowVotingPower",
      "msg": "Your voting power is not enough to join this clan"
    },
    {
      "code": 6005,
      "name": "TooEarlyToExitClan",
      "msg": "Can not exit clan waiting for the leave time"
    },
    {
      "code": 6006,
      "name": "UnexpectedExitingClan",
      "msg": "Must start leaving clan first"
    },
    {
      "code": 6007,
      "name": "NoNeedToUpdateProposalVote",
      "msg": "Proposal vote has correct weight already"
    },
    {
      "code": 6008,
      "name": "WrongCommunityVoterWeightAddin",
      "msg": "Wrong community voter addin (must be this program ID)"
    },
    {
      "code": 6009,
      "name": "EmptyCommunityVoterWeightAddin",
      "msg": "Must use this program ID as community voter weight addin"
    },
    {
      "code": 6010,
      "name": "WrongMaxCommunityVoterWeightAddin",
      "msg": "Wrong max community voter weight addin (must be this program ID)"
    },
    {
      "code": 6011,
      "name": "EmptyMaxCommunityVoterWeightAddin",
      "msg": "Must use this program ID as max community voter weight addin"
    },
    {
      "code": 6012,
      "name": "WrongCouncilVoterWeightAddin",
      "msg": "Wrong council voter weight addin (must be this program ID)"
    },
    {
      "code": 6013,
      "name": "MustUseCouncilVoterWeightAddin",
      "msg": "Must use this program ID as council voter weight addin"
    },
    {
      "code": 6014,
      "name": "WrongCouncilMaxVoteWeightAddin",
      "msg": "Wrong council max vote weight addin (must be this program ID)"
    },
    {
      "code": 6015,
      "name": "MustUseCouncilMaxVoteWeightAddin",
      "msg": "Must use this program ID as council max vote weight addin"
    },
    {
      "code": 6016,
      "name": "ChangingVoteDelegatedClanOwner",
      "msg": "Reset voting delegate before changing clan owner"
    },
    {
      "code": 6017,
      "name": "ClanIsRequired",
      "msg": "Must provide clan account"
    },
    {
      "code": 6018,
      "name": "ClanVoterWeightRecordIsRequired"
    },
    {
      "code": 6019,
      "name": "VotingWeightRecordIsRequired",
      "msg": "Must provide voting weight record account"
    },
    {
      "code": 6020,
      "name": "MaxVoterWeightIsRequired",
      "msg": "Must provide max voter weight"
    },
    {
      "code": 6021,
      "name": "ClanAuthorityIsRequired",
      "msg": "Must provide clan authority"
    },
    {
      "code": 6022,
      "name": "RerequestingLeavingClan",
      "msg": "Requesting leaving clan when already leaving"
    },
    {
      "code": 6023,
      "name": "CancelingNonExistentLeavingClanRequest",
      "msg": "Canceling leaving clan while not leaving"
    },
    {
      "code": 6024,
      "name": "AlreadyJoinedClan",
      "msg": "Requesting to join a clan while already participating in some clan. Must exit first"
    },
    {
      "code": 6025,
      "name": "MaxMembershipExceeded"
    },
    {
      "code": 6026,
      "name": "InvalidShareBp"
    },
    {
      "code": 6027,
      "name": "UnknownGoverningTokenMint"
    },
    {
      "code": 6028,
      "name": "InvalidCouncilMint"
    },
    {
      "code": 6029,
      "name": "CouncilMintRequired"
    },
    {
      "code": 6030,
      "name": "CouncilTokenHoldingsRequired"
    },
    {
      "code": 6031,
      "name": "CircularPluginChain"
    },
    {
      "code": 6032,
      "name": "VoterWeightExpiryIsNotImplemented"
    },
    {
      "code": 6033,
      "name": "UnexpectedWeightAction"
    },
    {
      "code": 6034,
      "name": "UnexpectedWeightActionTarget"
    },
    {
      "code": 6035,
      "name": "NextInstructionMustBeSetRealmConfig"
    },
    {
      "code": 6036,
      "name": "VoterWeightExpired"
    },
    {
      "code": 6037,
      "name": "TemporaryMembersNotAllowed"
    },
    {
      "code": 6038,
      "name": "TemporaryMembersNotUpdated"
    },
    {
      "code": 6039,
      "name": "UnexpectedClan"
    },
    {
      "code": 6040,
      "name": "MemberHasUnrelinquishedVotes"
    },
    {
      "code": 6041,
      "name": "MemberHasOutstandingProposals"
    },
    {
      "code": 6042,
      "name": "CanNotChangeNextResetTime"
    },
    {
      "code": 6043,
      "name": "InvalidResetStep"
    },
    {
      "code": 6044,
      "name": "InvalidNextResetTime"
    },
    {
      "code": 6045,
      "name": "Paused"
    },
    {
      "code": 6046,
      "name": "MemberVwrRequired"
    },
    {
      "code": 6047,
      "name": "ResetAllVoterWeightsFirst"
    }
  ]
};
