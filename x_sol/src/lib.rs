use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo,
    account_info::next_account_info,
    program_error::ProgramError,
    program::invoke_signed,
    sysvar::{rent::Rent, Sysvar},
    system_instruction::{create_account},
    borsh0_10::try_from_slice_unchecked
};

// Tweet Data Processing

#[derive(Debug)]
pub struct TweetData {
    bump:u8,
    seed:String,
    space:u8,
    content:String,
    owner: String,
    timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataBorsh {
    instruction:u8,
    bump:u8,
    seed:String,
    space:u8,
    content:String,
    owner: String,
    timestamp:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetPDADataBorsh {
    content:String,
    owner: String,
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

// Card Enum Settings

pub enum ProgramInstruction {
    AddTweet(TweetData),
    ModifyTweet(TweetData),
}

impl ProgramInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let selector = input[0];
        Ok(match selector {
            0 => {
                Self::AddTweet(create_tweet_data(TweetDataBorsh::try_from_slice(input).unwrap()))
            },
            1 => {
                Self::ModifyTweet(create_tweet_data(TweetDataBorsh::try_from_slice(input).unwrap()))
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
             modify_tweet(program_id, accounts, x)?;
        }
    }
    Ok(())
}

// Create Card

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

    msg!("unpacking state account");
    let mut tweet_data = try_from_slice_unchecked::<TweetPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    msg!("{:?}", tweet_data);

    tweet_data.content = data.content;
    tweet_data.owner= data.owner;
    tweet_data.timestamp = data.timestamp;

    msg!("{:?}", tweet_data);
    tweet_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}

// Get info - Read Cost

fn modify_tweet(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: TweetData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
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

    msg!("unpacking state account");
    let mut tweet_data = try_from_slice_unchecked::<TweetPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    msg!("{:?}", tweet_data);

    tweet_data.content = data.content;

    msg!("{:?}", tweet_data);
    tweet_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}