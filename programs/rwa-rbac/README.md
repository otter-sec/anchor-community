# DSToken Role-Based Access Control (RBAC)

## Background

DSToken on Solana is built on top of an extended fork of the RWA Standard, a set of on-chain programs used to issue and manage regulated real-world assets. The core protocol consists of multiple programs that together provide token lifecycle management, identity-based compliance enforcement, and policy configuration.

In the DSToken architecture, **all privileged operations are governed programmatically through role-based access control**, rather than through externally owned authority keypairs. The `rwa-rbac` project implements this access control layer and serves as the primary authority interface for all DSToken-related programs.

The RBAC program works in conjunction with the following on-chain components:

- Asset Controller Program (ACP)
- Policy Engine Program (PEP)
- Identity Registry Program (IRP)
- Identity Metadata Registry Program (IMR)

For each DSToken deployment (per mint), RBAC is configured as the **sole effective authority** controlling token issuance, transfers, compliance configuration, and administrative actions.

---

## Programs Overview

This repository contains two Solana programs:

- **Role-Based Access Control (RBAC) Program**
- **Identity Metadata Registry (IMR) Program**

These programs extend the RWA Standard to support DSToken-specific access control, investor metadata management, and parity with the Ethereum-based DSToken protocol.

---

## Role-Based Access Control (RBAC) Program

### Program Design

The RBAC program introduces the **AssetAccessController** as its core configuration account.

An `AssetAccessController` is created per DSToken deployment (per mint) and defines:

- An **admin authority**, responsible for configuring roles
- A **controller authority**, implemented as a **program-derived address (PDA)**

The controller authority PDA acts as the **signer authority** for all governed programs and accounts, including:

- Token-2022 mint
- Asset Controller account
- Policy Engine account
- Identity Registry account

This design intentionally separates the configuration authority (admin) from the operational signer (PDA), enabling programmatic enforcement of permissions and eliminating reliance on externally owned authority keys.

---

### Roles and Permissions

RBAC allows the creation of arbitrary **user roles**, each configured with fine-grained instruction-level permissions using feature flags.

In the context of DSToken, the protocol is typically initialized with the following expected roles:

- **MASTER**
- **ISSUER**
- **EXCHANGE**
- **TRANSFER_AGENT**

Each role defines which instructions it is authorized to execute across the governed programs. Wallets can be assigned to or removed from roles dynamically.

All privileged interactions with ACP, PEP, IRP, and IMR must be performed **through the RBAC program**, which enforces:

1. Role membership validation  
2. Feature-flag authorization  
3. Instruction discriminator matching  
4. CPI execution using the controller authority PDA as signer  

---

### CPI Instruction Model

The RBAC program exposes a set of CPI wrapper instructions that mirror administrative and operational instructions in the underlying programs.

Each CPI follows the same execution pattern:

1. Validate the caller’s role and permissions  
2. Validate instruction data  
3. Invoke the underlying program using the controller authority PDA  

This ensures that **all authority checks are centralized and auditable**, and that no privileged instruction can be executed without RBAC approval.

---

### Design Considerations

- **Per-token isolation**  
  Each DSToken deployment has its own `AssetAccessController`, roles, and permissions. Roles do not implicitly apply across different tokens unless explicitly configured.

- **No ownership verification**  
  RBAC does not independently verify that a governed account is intended to be managed by a given `AssetAccessController`. If a program or account accepts the controller authority PDA as its authority, RBAC assumes it is valid.

- **Programmatic governance**  
  All effective control is exercised via PDAs and role checks. No individual wallet directly holds mint, freeze, or compliance authority.

---

## Identity Metadata Registry (IMR) Program

### Program Design

The Identity Metadata Registry extends the Identity Registry Program by storing **investor-specific metadata** that is not required during transfer execution but is needed for compliance and auditability.

IMR maintains this data separately to avoid bloating accounts used in transfer hooks and policy enforcement.

---

### Accounts

- **Investor Account**  
  Stores investor metadata such as identifiers, proof hashes, country, and attribute levels.

- **Identity Mapping**  
  Provides a mapping between wallets and their associated investor identity, enabling multiple wallets to be linked to a single investor.

---

### Workflow

1. An authorized RBAC role registers a new investor using `register_investor`
2. An IdentityAccount is created in the Identity Registry
3. Metadata and initial levels are stored in IMR
4. Levels are synchronized to the Identity Registry for policy enforcement
5. Additional wallets may be attached or removed
6. Levels may be added or removed over time
7. Investors may be fully removed when no longer active

All IMR instructions validate authority through the Identity Registry and RBAC.

---

### Level Validation

When adding levels, the IMR enforces the following constraints:

- Proof hashes must be valid ASCII strings (≤ 32 characters)
- No duplicate levels
- Maximum of one country level
- Maximum of one attribute per type
- Maximum number of levels per investor
- Attribute status consistency

Levels are ultimately propagated to the Identity Registry and used by the Policy Engine during transfer validation.

---

## Installation

```bash
git submodule update --init --recursive
```

### Install dependencies:

### RWA Token SDK
cd deps/rwa-token/clients/rwa-token-sdk
yarn install

### Root
cd ../../../..
yarn install

### Client
cd client
yarn install

## Testing

Integration tests are located in rwa-rbac/tests.

Run tests with:

anchor test -- --features localnet

## Deployment

Before deploying to devnet or mainnet:

Update the list of authorized signers allowed to create AssetAccessController in
programs/rwa-rbac/src/instructions/admin/create_controller.rs

Compile with:

devnet feature flag for devnet

No feature flag for mainnet

## TypeScript Client

A TypeScript client is provided for interacting with the RBAC and IMR programs.

Install via:
```
yarn install @securitize/rwa-rbac
```

The RwaRbacClient is designed to align closely with the DSToken and RWA Token SDK interfaces and acts as the primary entry point for:

- Role configuration
- Investor registration
- Compliance administration
- Token lifecycle operations

Refer to the integration tests for end-to-end usage examples.
