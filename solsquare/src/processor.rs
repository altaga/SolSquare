use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    account_info::next_account_info,
    borsh0_10::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction::create_account
    ,
    sysvar::{rent::Rent, Sysvar}
};
use crate::create_tweet::create_tweet;
use crate::create_user::create_user;
use crate::modify_tweet::modify_tweet;
use crate::state::{create_tweet_data, create_tweet_data_mod, create_user_data, create_user_data_mod, TweetData, TweetDataBorsh, TweetDataMod, TweetDataModBorsh, TweetPDADataBorsh, UserData, UserDataBorsh, UserDataMod, UserDataModBorsh, UserPDADataBorsh};
use crate::transfer_funds::transfer_from_tweet;



pub enum ProgramInstruction {
    AddTweet(TweetData),
    ModifyTweet(TweetDataMod),
    TransferFunds(),
    AddUser(UserData),
    ModifyUser(UserDataMod),
}

impl ProgramInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let selector = input[0];
        Ok(match selector {
            0 => {
                Self::AddTweet(create_tweet_data(TweetDataBorsh::try_from_slice(input).unwrap()))
            },
            1 => {
                Self::ModifyTweet(create_tweet_data_mod(TweetDataModBorsh::try_from_slice(input).unwrap()))
            },
            2 => {
                Self::TransferFunds()
            },
            3 => {
                Self::AddUser(create_user_data(UserDataBorsh::try_from_slice(input).unwrap()))
            },
            4 => {
                Self::ModifyUser(create_user_data_mod(UserDataModBorsh::try_from_slice(input).unwrap()))
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}

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


// Modify User

fn modify_user(
    accounts: &[AccountInfo],
    data: UserDataMod
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    // Get Tweet Data
    let mut user_data = try_from_slice_unchecked::<UserDataMod>(&pda_account_info.data.borrow()).unwrap();
    // Security Check

    {
        if Pubkey::new_from_array(data.owner).ne(&payer_account_info.key) {
            return Err(ProgramError::IllegalOwner);
        }
    }


    msg!("Prev Data: {:?}", user_data);

    user_data.username = data.username;
    user_data.owner = data.owner;
    user_data.timestamp = data.timestamp;
    user_data.followers = data.followers;

    msg!("New Data: {:?}", user_data);
    user_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}