use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::borsh0_10::try_from_slice_unchecked;
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use solana_program::rent::Rent;
use solana_program::sysvar::Sysvar;
use crate::state::TweetDataMod;

pub(crate) fn transfer_from_tweet(
    accounts: &[AccountInfo],
)-> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let tweet_data = try_from_slice_unchecked::<TweetDataMod>(&pda_account_info.data.borrow()).unwrap();
    let rent_lamports = rent_sysvar_account_info.minimum_balance(pda_account_info.data_len().clone());

    {
        if Pubkey::new_from_array(tweet_data.owner).ne(&payer_account_info.key) {
            return Err(ProgramError::IllegalOwner);
        }
    }

    let balance = &pda_account_info.lamports();

    if balance.to_owned() <= rent_lamports {
        return Err(ProgramError::InsufficientFunds);
    }

    let amount= balance.to_owned() - rent_lamports;

    // transfer balance
    **pda_account_info.try_borrow_mut_lamports()? -= amount;
    **payer_account_info.try_borrow_mut_lamports()? += amount;

    Ok(())
}