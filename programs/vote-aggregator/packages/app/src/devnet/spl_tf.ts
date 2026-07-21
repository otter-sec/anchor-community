export type SplTf = {
  "version": "0.1.0",
  "name": "spl_tf",
  "instructions": [
    {
      "name": "initFaucet",
      "accounts": [
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxAmountPerRequest",
          "type": "u64"
        }
      ]
    },
    {
      "name": "destroyFaucet",
      "accounts": [
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rentCollector",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "airdrop",
      "accounts": [
        {
          "name": "faucet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "target",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "faucet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "maxAmountPerRequest",
            "type": "u64"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "FaucetBumps"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FaucetBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "adress",
            "type": "u8"
          },
          {
            "name": "mintAuthority",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

export const IDL: SplTf = {
  "version": "0.1.0",
  "name": "spl_tf",
  "instructions": [
    {
      "name": "initFaucet",
      "accounts": [
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxAmountPerRequest",
          "type": "u64"
        }
      ]
    },
    {
      "name": "destroyFaucet",
      "accounts": [
        {
          "name": "faucet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rentCollector",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "airdrop",
      "accounts": [
        {
          "name": "faucet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "target",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "faucet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "maxAmountPerRequest",
            "type": "u64"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "FaucetBumps"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "FaucetBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "adress",
            "type": "u8"
          },
          {
            "name": "mintAuthority",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
