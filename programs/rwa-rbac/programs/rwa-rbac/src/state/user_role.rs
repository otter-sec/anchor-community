use anchor_lang::prelude::*;

use crate::error::ErrorCode;

#[account]
pub struct UserRole {
    /// Controller that user role is designated for.
    pub asset_access_controller: Pubkey,

    /// ID of UserRole. Matches AssetAccessController.user_roles_count at time of creation.
    pub id: u64,

    /// Name of this role.
    pub name: String,

    /// Bitflag of allowed admin instructions.
    pub allowed_admin_ixs: u64,

    /// Bitflag of allowed Medici CPI instructions.
    pub allowed_medici_ixs: u64,

    /// If true, this is the master role.
    pub is_master_role: bool,

    /// List of users assigned with this role.
    pub users: Vec<Pubkey>,
}

impl UserRole {
    /// Assume name has max size of 64 bytes and includes 8 byte discriminator.
    pub const BASE_SIZE: usize = 136;

    /// Returns true if the user role contains ANY of the admin flags.
    pub fn has_any_admin_flag(&self, flag: AdminFlags) -> bool {
        AdminFlags::from_bits(self.allowed_admin_ixs)
            .unwrap()
            .intersects(flag)
    }

    /// Returns true if the user role contains all of the medici flags.
    pub fn has_all_medici_flag(&self, flag: MediciFlags) -> bool {
        MediciFlags::from_bits(self.allowed_medici_ixs)
            .unwrap()
            .contains(flag)
    }

    pub fn set_master_role(&mut self) {
        self.is_master_role = true;
    }

    pub fn update_fields(
        &mut self,
        name: String,
        allowed_admin_ixs: u64,
        allowed_medici_ixs: u64,
    ) -> Result<()> {
        if !name.is_ascii() || name.len() > 64 {
            return err!(ErrorCode::InvalidName);
        }

        // Check that no unknown bits are set.
        if AdminFlags::from_bits(allowed_admin_ixs).is_none()
            || MediciFlags::from_bits(allowed_medici_ixs).is_none()
        {
            return err!(ErrorCode::InvalidFlags);
        }

        self.name = name;
        self.allowed_admin_ixs = allowed_admin_ixs;
        self.allowed_medici_ixs = allowed_medici_ixs;

        Ok(())
    }

    /// Add users to users vector if user is not already assigned.
    pub fn assign_users(&mut self, users_to_assign: Vec<Pubkey>) {
        users_to_assign.iter().for_each(|user| {
            if !self.users.contains(user) {
                self.users.push(*user);
            }
        });
    }

    /// Remove users from users vector if the user is currently assigned.
    pub fn remove_users(&mut self, users_to_remove: Vec<Pubkey>) {
        self.users.retain(|user| !users_to_remove.contains(user));
    }
}

bitflags::bitflags! {
  // Internal Instructions
  pub struct AdminFlags: u64 {
      const CREATE_OR_DELETE_USER_ROLE = 1 << 0;
      const MODIFY_USER_ROLE = 1 << 1;
      const ASSIGN_OR_REMOVE_ANY_USER_ROLE = 1 << 2;
      const ASSIGN_OR_REMOVE_CURRENT_USER_ROLE = 1 << 3;
      const SET_LUT_ADDRESS = 1 << 4;
      const WITHDRAW_EXCESS_RENT = 1 << 5;
  }

  // CPI Instructions
  pub struct MediciFlags: u64 {
      const UPDATE_ASSET_METADATA = 1 << 0;
      const THAW_TOKEN_ACCOUNT = 1 << 1;
      const FREEZE_TOKEN_ACCOUNT = 1 << 2;
      const ISSUE_TOKENS = 1 << 3;
      const REVOKE_TOKENS = 1 << 4;
      const UPDATE_INTEREST_BEARING_MINT_RATE = 1 << 5;
      const ATTACH_TO_POLICY_ACCOUNT = 1 << 6;
      const CREATE_POLICY_ACCOUNT = 1 << 7;
      const DETACH_FROM_POLICY_ACCOUNT = 1 << 8;
      const ADD_LEVELS = 1 << 9;
      const ADD_LEVEL_TO_IDENTITY_ACCOUNT = 1 << 10;
      const REGISTER_INVESTOR = 1 << 11;
      const REMOVE_LEVELS = 1 << 12;
      const REMOVE_INVESTOR = 1 << 13;
      const EDIT_IDENTITY_METADATA = 1 << 14;
      const REFRESH_LEVEL_TO_IDENTITY_ACCOUNT = 1 << 15;
      const ATTACH_WALLET_TO_IDENTITY = 1 << 16;
      const DETACH_WALLET_FROM_IDENTITY = 1 << 17;
      const SEIZE_TOKENS = 1 << 18;
      const CREATE_IDENTITY_ACCOUNT = 1 << 19;
      const CREATE_INVESTOR_LOCKS = 1 << 20;
      const CLOSE_INVESTOR_LOCKS = 1 << 21;
      const ADD_TOKEN_LOCK = 1 << 22;
      const REMOVE_TOKEN_LOCK = 1 << 23;
      const CHANGE_COUNTERS = 1 << 24;
      const CHANGE_COUNTER_LIMITS = 1 << 25;
      const CHANGE_COUNTRY = 1 << 26;
      const CHANGE_MAPPING = 1 << 27;
      const CHANGE_ISSUANCE_POLICIES = 1 << 28;
      const REMOVE_IDENTITY_ACCOUNT = 1 << 29;
  }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_all_admin_flag() {
        let admin_flags_length = AdminFlags::all().into_iter().count();
        let user_role_all_admin = UserRole {
            asset_access_controller: Pubkey::default(),
            id: 0,
            name: String::from("test_name"),
            allowed_admin_ixs: (2u64).pow(admin_flags_length as u32) - 1, // Allow all flags
            allowed_medici_ixs: 0,
            users: vec![],
            is_master_role: false,
        };

        // Check that has_any_admin_flag returns true for each individual flag (since role allows all flags).
        for flag in AdminFlags::all().into_iter() {
            println!("Flag {:?}", flag.0);
            assert!(user_role_all_admin.has_any_admin_flag(flag));
        }
    }

    #[test]
    fn test_any_admin_flag() {
        let user_role = UserRole {
            asset_access_controller: Pubkey::default(),
            id: 0,
            name: String::from("test_name"),
            allowed_admin_ixs: AdminFlags::ASSIGN_OR_REMOVE_ANY_USER_ROLE.bits(),
            allowed_medici_ixs: 0,
            users: vec![],
            is_master_role: false,
        };

        let matching_flag = AdminFlags::ASSIGN_OR_REMOVE_ANY_USER_ROLE
            .union(AdminFlags::ASSIGN_OR_REMOVE_CURRENT_USER_ROLE);

        // Expect to be true since role has one of the matching flags allowed.
        assert!(user_role.has_any_admin_flag(matching_flag));
    }

    #[test]
    fn test_has_medici_flag_exact_match() {
        let user_role = UserRole {
            asset_access_controller: Pubkey::new_unique(),
            id: 1,
            name: "MediciRole".to_string(),
            allowed_admin_ixs: 0,
            allowed_medici_ixs: MediciFlags::THAW_TOKEN_ACCOUNT.bits(),
            users: vec![],
            is_master_role: false,
        };
        assert!(user_role.has_all_medici_flag(MediciFlags::THAW_TOKEN_ACCOUNT));
    }

    #[test]
    fn test_has_medici_flag_more_flags_than_needed() {
        let user_role = UserRole {
            asset_access_controller: Pubkey::new_unique(),
            id: 1,
            name: "OverPrivilegedRole".to_string(),
            allowed_admin_ixs: 0,
            allowed_medici_ixs: (MediciFlags::THAW_TOKEN_ACCOUNT.bits()
                | MediciFlags::FREEZE_TOKEN_ACCOUNT.bits()),
            users: vec![],
            is_master_role: false,
        };

        assert!(user_role.has_all_medici_flag(MediciFlags::THAW_TOKEN_ACCOUNT));
        assert!(user_role.has_all_medici_flag(MediciFlags::FREEZE_TOKEN_ACCOUNT));
    }

    #[test]
    fn test_has_medici_flag_less_flags_than_needed() {
        let user_role = UserRole {
            asset_access_controller: Pubkey::new_unique(),
            id: 1,
            name: "UnderPrivilegedRole".to_string(),
            allowed_admin_ixs: 0,
            allowed_medici_ixs: (MediciFlags::THAW_TOKEN_ACCOUNT.bits()
                | MediciFlags::FREEZE_TOKEN_ACCOUNT.bits()),
            users: vec![],
            is_master_role: false,
        };

        // Testing for 3 flags while only having 2 should fail.
        assert!(!user_role.has_all_medici_flag(
            MediciFlags::THAW_TOKEN_ACCOUNT
                | MediciFlags::FREEZE_TOKEN_ACCOUNT
                | MediciFlags::ISSUE_TOKENS
        ));
    }
}
