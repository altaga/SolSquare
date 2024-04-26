use std::str::FromStr;

use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::borsh0_10::try_from_slice_unchecked;
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use solana_program::rent::Rent;
use solana_program::sysvar::Sysvar;


use crate::state::TweetPDADataBorsh;

pub(crate) fn transfer_funds(accounts: &[AccountInfo]) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let rent_lamports = rent_sysvar_account_info.minimum_balance(184);
    // Does the from account have enough lamports to transfer?
    // TODO: Get the maximum amount of lamports from the pda in order to transfer lamports to the tweet's owner.

    let tweet_data = try_from_slice_unchecked::<TweetPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();
    let lamports_to_transfer = **pda_account_info.lamports.borrow_mut() - rent_lamports;

    if **pda_account_info.try_borrow_lamports()? < lamports_to_transfer {
        return Err(ProgramError::InsufficientFunds);
    }
    // Debit from_account and credit to_account


    let pub_key = Pubkey::from_str(tweet_data.owner.as_str()).unwrap();
    if payer_account_info.key != &pub_key {
        return Err(ProgramError::IllegalOwner);
    }

    **pda_account_info.try_borrow_mut_lamports()? -= lamports_to_transfer;
    **payer_account_info.try_borrow_mut_lamports()? += lamports_to_transfer;
    Ok(())
}