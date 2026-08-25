use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unknown program instruction from CPI data")]
    UnknownInstruction,

    #[msg("Invalid hash")]
    InvalidHash,

    #[msg("Invalid levels")]
    InvalidLevels,

    #[msg("Invalid country level")]
    InvalidCountryLevel,

    #[msg("Invalid region level")]
    InvalidRegionLevel,

    #[msg("Invalid attribute level")]
    InvalidAttribute,

    #[msg("Unknown level")]
    UnknownLevel,
}
