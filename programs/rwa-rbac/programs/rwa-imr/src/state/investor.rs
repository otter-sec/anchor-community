use crate::error::ErrorCode;
use anchor_lang::prelude::*;
use rbac_utils::constants::{
    Country, ACCREDITED_ATTRIBUTES, KYC_ATTRIBUTES, OTHER_LEVELS, PROFESSIONAL_ATTRIBUTES,
    QUALIFIED_ATTRIBUTES, SPECIAL_WALLETS,
};
use rbac_utils::is_valid_hash;
use std::collections::HashSet;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct LevelData {
    /// Maps to IdentityAccount level used in RWA Token.
    pub level: u8,

    /// Hash generated off-chain.
    #[max_len(32)]
    pub proof_hash: String,
}

#[derive(Default, InitSpace)]
#[account]
pub struct Investor {
    /// Authority keypair allowed to write this account, will match authority or delegate of IdentityRegistry
    /// at time of creation of IdentityAccount.
    pub authority: Pubkey,

    /// IdentityAccount associated with this investor.
    pub identity_account: Pubkey,

    /// IdentityRegistryAccount associated with this investor.
    pub identity_registry: Pubkey,

    /// PDA Seed Bump
    pub bump: u8,

    /// Unique ID for Investor, generated off-chain.
    #[max_len(32)]
    pub investor_id: String,

    /// Metadata for investor, generated off-chain.
    #[max_len(32)]
    pub collision_hash: String,

    /// User that last modified this investor. Read from payer of instruction.
    pub last_updated_by: Pubkey,

    /// Levels assigned to investor.
    #[max_len(10)]
    pub levels: Vec<LevelData>,

    pub country: u8,
}

impl Investor {
    pub const SIZE: usize = 525;

    fn are_levels_unique(&self) -> bool {
        let mut seen_levels = HashSet::new();
        self.levels
            .iter()
            .all(|level_data| seen_levels.insert(level_data.level))
    }

    pub fn validate_country(&self) -> Result<()> {
        require!(
            self.country >= Country::Afghanistan as u8 && self.country <= Country::Zimbabwe as u8,
            ErrorCode::InvalidCountryLevel
        );
        Ok(())
    }

    pub fn validate_levels(&self) -> Result<()> {
        // Check that each level appears only once.
        require!(self.are_levels_unique(), ErrorCode::InvalidLevels);

        let mut accredited = vec![];
        let mut qualified = vec![];
        let mut professional = vec![];
        let mut kyc = vec![];
        let mut special = vec![];

        // Group levels into vec based on its category.
        for level_data in &self.levels {
            let level = level_data.level;
            if ACCREDITED_ATTRIBUTES.contains(&level) {
                accredited.push(level);
            } else if KYC_ATTRIBUTES.contains(&level) {
                kyc.push(level);
            } else if QUALIFIED_ATTRIBUTES.contains(&level) {
                qualified.push(level);
            } else if PROFESSIONAL_ATTRIBUTES.contains(&level) {
                professional.push(level);
            } else if SPECIAL_WALLETS.contains(&level) {
                special.push(level);
            } else if !OTHER_LEVELS.contains(&level) {
                msg!("Level {} is not supported", level);
                return err!(ErrorCode::UnknownLevel);
            }
        }

        // Check that user isn't a special wallet.
        require!(special.is_empty(), ErrorCode::InvalidLevels);

        // Check that there's at most 1 status per attribute type.
        require!(accredited.len() <= 1, ErrorCode::InvalidAttribute);
        require!(kyc.len() <= 1, ErrorCode::InvalidAttribute);
        require!(qualified.len() <= 1, ErrorCode::InvalidAttribute);
        require!(professional.len() <= 1, ErrorCode::InvalidAttribute);

        // Check that all proof hashes are valid (ascii and <= 32 chars).
        require!(
            self.levels.iter().all(|x| is_valid_hash(&x.proof_hash)),
            ErrorCode::InvalidHash
        );

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use rbac_utils::constants::{Country, Level};

    use super::*;

    fn build_investor(levels: Vec<Level>, proof_hashes: Option<Vec<String>>) -> Investor {
        let mut investor = Investor {
            ..Default::default()
        };

        let hashes = proof_hashes.unwrap_or_default();

        for (index, level) in levels.iter().enumerate() {
            investor.levels.push(LevelData {
                level: *level as u8,
                proof_hash: hashes.get(index).unwrap_or(&String::new()).to_string(),
            });
        }
        investor
    }

    #[test]
    fn test_duplicate_levels() {
        // Should pass since KYC_APPROVED level appears only once.
        let investor = build_investor(vec![Level::KYC_APPROVED], None);
        assert!(investor.validate_levels().is_ok());

        // Should fail since level 1 appears more than once.
        let investor = build_investor(vec![Level::KYC_APPROVED, Level::KYC_APPROVED], None);
        assert!(investor.validate_levels().is_err());
    }

    #[test]
    fn test_special_wallets() {
        // Should fail since investor is not allowed to be a special wallet.
        let investor = build_investor(vec![Level::PLATFORM_WALLET, Level::EXCHANGE_WALLET], None);
        assert!(investor.validate_levels().is_err());
    }

    #[test]
    fn test_invalid_proof_hashes() {
        // Should fail since proof hash is non ascii.
        let investor = build_investor(
            vec![Level::KYC_APPROVED, Level::ACCREDITED],
            Some(vec!["café".to_string(), "cafx".to_string()]),
        );
        assert!(investor.validate_levels().is_err());

        // Should pass since proof hash is valid.
        let investor = build_investor(
            vec![Level::KYC_APPROVED],
            Some(vec!["a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6".to_string()]),
        );
        assert!(investor.validate_levels().is_ok());

        // Should fail since proof hash is too long.
        let investor = build_investor(
            vec![Level::KYC_APPROVED],
            Some(vec!["abca1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6".to_string()]),
        );
        assert!(investor.validate_levels().is_err());
    }

    #[test]
    fn test_unknown_levels() {
        let mut investor =
            build_investor(vec![Level::KYC_APPROVED], Some(vec!["cafe".to_string()]));

        // Should fail since level is not a known enum.
        investor.levels.push(LevelData {
            level: 246,
            proof_hash: String::new(),
        });
        assert!(investor.validate_levels().is_err());

        // Should fail since level is not a known enum.
        investor.levels.pop();
        investor.levels.push(LevelData {
            level: 49,
            proof_hash: String::new(),
        });
        assert!(investor.validate_levels().is_err());
    }

    #[test]
    fn test_country_region_levels() {
        // Should fail with countries as regular levels.
        let mut investor = build_investor(vec![], None);
        investor.levels.push(LevelData {
            level: Country::Cambodia as u8,
            proof_hash: String::new(),
        });
        assert!(investor.validate_levels().is_err());

        // Should fail with regions as levels.
        let investor = build_investor(vec![Level::EU], None);
        assert!(investor.validate_levels().is_err());

        // should fail with invalid country
        let investor = build_investor(vec![], None);
        assert!(investor.validate_country().is_err());

        // Should succeed with country and region match.
        let mut investor = build_investor(vec![], None);
        investor.country = Country::UnitedStates as u8;
        assert!(investor.validate_country().is_ok());
    }

    #[test]
    fn test_attribute_levels() {
        // Should fail with two statuses from same attribute.
        let investor = build_investor(
            vec![Level::KYC_APPROVED, Level::KYC_APPROVED_REJECTED],
            None,
        );
        assert!(investor.validate_levels().is_err());

        let investor = build_investor(vec![Level::ACCREDITED, Level::ACCREDITED_PENDING], None);
        assert!(investor.validate_levels().is_err());

        let investor = build_investor(
            vec![Level::QUALIFIED_PENDING, Level::QUALIFIED_REJECTED],
            None,
        );
        assert!(investor.validate_levels().is_err());

        let investor = build_investor(vec![Level::PROFESSIONAL_PENDING, Level::PROFESSIONAL], None);
        assert!(investor.validate_levels().is_err());

        // Should fail with statuses from different attributes.
        let investor = build_investor(
            vec![
                Level::KYC_APPROVED,
                Level::ACCREDITED_PENDING,
                Level::QUALIFIED_PENDING,
                Level::PROFESSIONAL_REJECTED,
            ],
            None,
        );
        assert!(investor.validate_levels().is_ok());
    }

    #[test]
    fn test_full_levels_combination() {
        // Generic case with all combinations should pass.
        let mut investor = build_investor(
            vec![
                Level::KYC_APPROVED,
                Level::ACCREDITED,
                Level::PROFESSIONAL,
                Level::QUALIFIED_PENDING,
                Level::Investor,
                Level::InvestorLocked,
            ],
            None,
        );
        investor.country = Country::UnitedStates as u8;
        assert!(investor.validate_levels().is_ok());
        assert!(investor.validate_country().is_ok());
    }
}
