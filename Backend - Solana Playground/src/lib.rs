use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    account_info::AccountInfo,
    account_info::next_account_info,
    program_error::ProgramError,
    program::invoke_signed,
    sysvar::{rent::Rent, Sysvar},
    system_instruction::{create_account},
    borsh0_10::try_from_slice_unchecked,
    pubkey,
    pubkey::Pubkey
};
use std::str::FromStr;

// Tweet Data Processing

#[derive(Debug)]
pub struct TweetData {
    bump:u8,
    seed:String,
    space:u8,
    content:String,
    owner: [u8; 32],
    timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataBorsh {
    instruction:u8,
    bump:u8,
    seed:String,
    space:u8,
    content:String,
    owner: [u8; 32],
    timestamp:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetPDADataBorsh {
    content:String,
    owner: [u8; 32],
    timestamp:u32
}

pub fn create_tweet_data(payload:TweetDataBorsh) -> TweetData{
    TweetData {
        bump:payload.bump,
        seed:payload.seed,
        space:payload.space,
        content: payload.content,
        owner: payload.owner,
        timestamp:payload.timestamp
    }
}

// Modify Tweet Data

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetDataMod {
    content:String,
    owner: [u8; 32],
    timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataModBorsh {
    instruction:u8,
    content:String,
    owner: [u8; 32],
    timestamp:u32
}

pub fn create_tweet_data_mod(payload:TweetDataModBorsh) -> TweetDataMod{
    TweetDataMod {
        content: payload.content,
        owner: payload.owner,
        timestamp:payload.timestamp
    }
}

// User Data Processing

#[derive(Debug)]
pub struct UserData {
    bump:u8,
    seed:String,
    space:u8,
    username:String,
    owner: [u8; 32],
    timestamp: u32,
    followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataBorsh {
    instruction:u8,
    bump:u8,
    seed:String,
    space:u8,
    username:String,
    owner: [u8; 32],
    timestamp: u32,
    followers:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserPDADataBorsh {
    username:String,
    owner: [u8; 32],
    timestamp: u32,
    followers:u32
}

pub fn create_user_data(payload:UserDataBorsh) -> UserData{
    UserData {
        bump:payload.bump,
        seed:payload.seed,
        space:payload.space,
        username:payload.username,
        owner: payload.owner,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}

// Modify Tweet Data

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserDataMod {
    username:String,
    owner: [u8; 32],
    timestamp: u32,
    followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataModBorsh {
    instruction:u8,
    username:String,
    owner: [u8; 32],
    timestamp: u32,
    followers:u32
}

pub fn create_user_data_mod(payload:UserDataModBorsh) -> UserDataMod{
    UserDataMod {
        username:payload.username,
        owner: payload.owner,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}

// Program Enum Settings

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

// Create Tweet

fn create_tweet(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: TweetData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let system_program = next_account_info(account_info_iter)?;
    // find space and minimum rent required for account
    let _space = data.space;
    let bump = data.bump;
    let seed = data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    let rent_lamports = rent_sysvar_account_info.minimum_balance(_space.into());

    invoke_signed(
        &create_account(
            &payer_account_info.key,
            &pda_account_info.key,
            rent_lamports,
            _space.into(),
            program_id
        ),
        &[
            payer_account_info.clone(),
            pda_account_info.clone(),
            system_program.clone(),
        ],
         &[signers_seeds],
    )?;

    let mut tweet_data = try_from_slice_unchecked::<TweetPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    tweet_data.content = data.content;
    tweet_data.owner= data.owner;
    tweet_data.timestamp = data.timestamp;

    msg!("Tweet Data: {:?}", tweet_data);
    tweet_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}

// Modidy Tweet

fn modify_tweet(
    accounts: &[AccountInfo], 
    data: TweetDataMod
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    // Get Tweet Data
    let mut tweet_data = try_from_slice_unchecked::<TweetDataMod>(&pda_account_info.data.borrow()).unwrap();
    
    // Security Check
    {
        if Pubkey::new_from_array(data.owner).ne(&payer_account_info.key) {
        return Err(ProgramError::IllegalOwner); 
        }
    }

    msg!("Prev Data: {:?}", tweet_data);

    tweet_data.content = data.content;
    tweet_data.timestamp = data.timestamp;
    tweet_data.owner = data.owner;

    msg!("New Data: {:?}", tweet_data);
    tweet_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}

// Transfer from Tweet

fn transfer_from_tweet(
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

// Create User

fn create_user(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: UserData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let system_program = next_account_info(account_info_iter)?;
    // find space and minimum rent required for account
    let _space = data.space;
    let bump = data.bump;
    let seed = data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    let rent_lamports = rent_sysvar_account_info.minimum_balance(_space.into());

    invoke_signed(
        &create_account(
            &payer_account_info.key,
            &pda_account_info.key,
            rent_lamports,
            _space.into(),
            program_id
        ),
        &[
            payer_account_info.clone(),
            pda_account_info.clone(),
            system_program.clone(),
        ],
         &[signers_seeds],
    )?;

    let mut user_data = try_from_slice_unchecked::<UserPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    user_data.username = data.username;
    user_data.owner = data.owner;
    user_data.timestamp = data.timestamp;
    user_data.followers = data.followers;

    msg!("User Data: {:?}", user_data);
    user_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

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