use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    account_info::next_account_info,
    borsh0_10::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg
    ,
    program_error::ProgramError,
    pubkey::Pubkey
};

use crate::create_tweet::create_tweet;
use crate::create_user::create_user;
use crate::instructions::ProgramInstruction;
use crate::modify_tweet::modify_tweet;
use crate::state::{create_tweet_data, create_tweet_data_mod, create_user_data, create_user_data_mod, TweetData, TweetDataBorsh, TweetDataMod, TweetDataModBorsh, UserData, UserDataBorsh, UserDataMod, UserDataModBorsh};
use crate::transfer_funds::transfer_from_tweet;

// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Entry Point

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer {
        return Err(ProgramError::IllegalOwner);
    }

    let instruction = ProgramInstruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        ProgramInstruction::AddTweet(x) => {
            msg!("Add Tweet");
            create_tweet(program_id, accounts, x)?;
        },
        ProgramInstruction::ModifyTweet(x) => {
            msg!("Modify Tweet");
            modify_tweet(accounts, x)?;
        },
        // Todo -> Burn tweet
        ProgramInstruction::TransferFunds() => {
            msg!("Transfer Funds from Tweet");
            transfer_from_tweet(accounts)?;
        },
        ProgramInstruction::AddUser(x) => {
            msg!("Add User");
            create_user(program_id, accounts, x)?;
        },
        ProgramInstruction::ModifyUser(x) => {
            msg!("Modify User");
            modify_user( accounts, x)?;
        },
    }
    Ok(())
}