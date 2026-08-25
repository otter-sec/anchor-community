use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_error::ProgramError;

use crate::constants::IDENTITY_REGISTRY_ID;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct IdentityLevel {
    pub level: u8,
    pub expiry: i64,
}

/// Account layout of IdentityAccount defined by IdentityRegistry program.
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct IdentityAccount {
    /// version of the account
    pub version: u8,
    /// identity registry to which the account belongs
    pub identity_registry: Pubkey,
    /// owner of the identity account
    pub owner: Pubkey,

    pub num_wallets: u16,

    pub country: u8,

    // identity levels corresponding to the user
    pub levels: Vec<IdentityLevel>,
}

impl IdentityAccount {
    const DISCRIMINATOR: [u8; 8] = [194, 90, 181, 160, 182, 206, 116, 158];

    pub fn deserialize_checked(info: &AccountInfo<'_>) -> Result<Self> {
        // Check that account is owned by the correct program.
        require_keys_eq!(*info.owner, IDENTITY_REGISTRY_ID);

        // Check account discriminator.
        let v = info.data.borrow();
        if !v.starts_with(&Self::DISCRIMINATOR) {
            return Err(ProgramError::InvalidAccountData.into());
        }

        let acc = Self::try_from_slice(&v[8..])?;
        Ok(acc)
    }
}
