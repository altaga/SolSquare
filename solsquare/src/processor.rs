
use borsh::BorshSerialize;
use solana_program::{
    account_info::AccountInfo,
    account_info::next_account_info,
    borsh0_10::try_from_slice_unchecked,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction::create_account,
    sysvar::{rent::Rent, Sysvar},
};

use crate::state::{
    TweetData,
    TweetDataBorsh,
    TweetPDADataBorsh,
};

// Tweet Data Processing

pub fn create_tweet_data(payload: TweetDataBorsh) -> TweetData {
    TweetData {
        bump: payload.bump,
        seed: payload.seed,
        space: payload.space,
        content: payload.content,
        owner: payload.owner,
        timestamp: payload.timestamp,
    }
}

// Create Card

pub(crate) fn create_tweet(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: TweetData,
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
            program_id,
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
    tweet_data.owner = data.owner;
    tweet_data.timestamp = data.timestamp;

    msg!("{:?}", tweet_data);
    tweet_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}

// Get info - Read Cost

pub(crate) fn modify_tweet(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: TweetData,
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

