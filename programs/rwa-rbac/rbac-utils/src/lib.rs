pub mod constants;
pub mod discriminators;
pub mod external_accounts;

pub use discriminators::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

/// Checks if a string is a valid hash. In this system, we only check if the string
/// is ascii char and has length of <= 32.
///
/// For context, there are no limitations on string length or formatting in the EVM contract.
/// On the client side, these strings are always generated as a 32 character hex string.
pub fn is_valid_hash(hash: &str) -> bool {
    hash.is_ascii() && hash.len() <= 32
}

/// Calculates additional lamports needed for account realloc and transfers them payer
/// from to target.
pub fn transfer_lamports_for_realloc<'info>(
    payer: AccountInfo<'info>,
    target: AccountInfo<'info>,
    new_len: usize,
) -> Result<()> {
    // Calculate additional lamports needed for new account size.
    let rent = Rent::get()?;
    let new_minimum_balance = rent.minimum_balance(new_len);
    let lamports_diff = new_minimum_balance.saturating_sub(target.lamports());

    // Transfer additional lamports to target.
    if lamports_diff > 0 {
        let ix = transfer(payer.key, target.key, lamports_diff);
        invoke(&ix, &[payer, target])?;
    }
    Ok(())
}
