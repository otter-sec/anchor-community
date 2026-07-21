use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unknown program instruction from CPI data")]
    UnknownInstruction,

    #[msg("Invalid name")]
    InvalidName,

    #[msg("Invalid user role")]
    InvalidUserRole,

    #[msg("Data is not empty")]
    DataIsNotEmpty,

    #[msg("Unknown account discriminator")]
    UnknownAccount,

    #[msg("Missing reason or code")]
    MissingReason,

    #[msg("Invalid level")]
    InvalidLevel,

    #[msg("Illegal operation")]
    IllegalOperation,

    #[msg("Invalid flag bits")]
    InvalidFlags,

    #[msg("Cannot empty master role of users")]
    CannotEmptyMasterRole,

    #[msg("Cannot void authority")]
    CannotVoidAuthority,

    #[msg("Invalid master role")]
    InvalidMasterRole,

    #[msg("Cannot delete master role")]
    CannotDeleteMasterRole,

    #[msg("Unauthorized admin signer")]
    UnauthorizedSigner,
}
