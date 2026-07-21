// Macro to count number of discriminators for array sizing.
macro_rules! count_items {
  ( $($item:expr),* $(,)? ) => {
      <[()]>::len(&[$(count_items!(@sub $item)),*])
  };
  (@sub $item:expr) => { () };
}

// Macro to define each discriminator constant and build a fixed-size array
// for compile time uniqueness check.
macro_rules! define_discriminators {
  ( $( $name:ident: $value:expr ),* $(,)? ) => {
      $(
          pub const $name: [u8; 8] = $value;
      )*
      pub const INSTRUCTIONS: [[u8; 8]; count_items!($($name),*)] = [
          $(
              $name,
          )*
      ];
  }
}

define_discriminators! {
  CREATE_ASSET_CONTROLLER_IX: [97, 185, 6, 250, 248, 242, 68, 105],
  ADD_LEVEL_TO_IDENTITY_ACCOUNT_IX: [102, 204, 64, 169, 252, 177, 192, 232],
  REVOKE_IDENTITY_ACCOUNT_IX: [77, 88, 182, 61, 235, 49, 2, 137],
  ATTACH_WALLET_TO_IDENTITY_IX: [61, 129, 252, 190, 8, 202, 179, 90],
  CHANGE_COUNTRY_IX: [208, 227, 224, 246, 9, 254, 62, 179],
  CREATE_IDENTITY_ACCOUNT_IX: [82, 240, 35, 129, 113, 134, 116, 70],
  DETACH_WALLET_FROM_IDENTITY_IX: [166, 70, 236, 254, 166, 116, 201, 50],
  REFRESH_LEVEL_TO_IDENTITY_ACCOUNT_IX: [23, 68, 237, 111, 144, 169, 239, 91],
  REMOVE_LEVEL_FROM_IDENTITY_ACCOUNT_IX: [194, 231, 187, 54, 197, 136, 170, 55],
  CLOSE_MINT_ACCOUNT_IX: [14, 121, 72, 246, 96, 224, 42, 162],
  FREEZE_TOKEN_ACCOUNT_IX: [138, 168, 178, 109, 205, 224, 209, 93],
  ISSUE_TOKENS_IX: [40, 207, 145, 106, 249, 54, 23, 179],
  REVOKE_TOKENS_IX: [215, 42, 15, 134, 173, 80, 33, 21],
  SEIZE_TOKENS_IX: [79, 30, 69, 54, 78, 1, 16, 23],
  THAW_TOKEN_ACCOUNT_IX: [199, 172, 96, 93, 244, 252, 137, 171],
  UPDATE_METADATA_IX: [170, 182, 43, 239, 97, 78, 225, 186],
  UPDATE_INTEREST_BEARING_MINT_RATE_IX: [29, 174, 109, 163, 227, 75, 2, 144],
  ATTACH_TO_POLICY_ENGINE_IX: [99, 59, 117, 21, 146, 11, 54, 173],
  CHANGE_COUNTER_LIMITS_IX: [200, 2, 8, 102, 43, 168, 141, 139],
  CHANGE_COUNTERS_IX: [156, 107, 88, 204, 113, 131, 241, 192],
  CHANGE_ISSUANCE_POLICIES_IX: [186, 201, 163, 157, 32, 250, 166, 37],
  CHANGE_MAPPING_IX: [103, 1, 52, 20, 160, 194, 113, 125],
  DETACH_FROM_POLICY_ENGINE_IX: [156, 137, 67, 121, 46, 207, 45, 12],
  ADD_TOKEN_LOCK_IX: [195, 26, 109, 80, 46, 7, 195, 55],
  CLOSE_INVESTOR_LOCKS_IX: [255, 60, 220, 115, 217, 104, 157, 171],
  CREATE_INVESTOR_LOCKS_IX: [223, 81, 139, 162, 204, 48, 24, 213],
  REMOVE_TOKEN_LOCK_IX: [168, 128, 173, 188, 172, 228, 154, 90],
  ADD_LEVELS_IX: [101, 239, 15, 85, 60, 13, 183, 192],
  REGISTER_INVESTOR_IX: [95, 16, 66, 212, 152, 123, 136, 173],
  REMOVE_INVESTOR_IX: [93, 0, 162, 199, 76, 5, 180, 2],
  REMOVE_LEVELS_IX: [200, 96, 65, 253, 97, 55, 16, 192],
  SET_COUNTERS_IX: [127, 151, 147, 141, 171, 53, 28, 135],
  ADD_LOCK_IX: [242, 102, 183, 107, 109, 168, 82, 140],
  REMOVE_LOCK_IX: [1, 17, 121, 74, 62, 241, 127, 120],
}

#[allow(dead_code)]
const fn arrays_equal(a: &[u8; 8], b: &[u8; 8]) -> bool {
    let mut i = 0;
    while i < 8 {
        if a[i] != b[i] {
            return false;
        }
        i += 1;
    }
    true
}

// Compile-time uniqueness check.
const _: () = {
    let mut i = 0;
    let len = INSTRUCTIONS.len();
    while i < len {
        let mut j = i + 1;
        while j < len {
            assert!(!arrays_equal(&INSTRUCTIONS[i], &INSTRUCTIONS[j]));
            j += 1;
        }
        i += 1;
    }
};
