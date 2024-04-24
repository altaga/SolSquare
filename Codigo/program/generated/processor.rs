// This file is auto-generated from the CIDL source.
// Editing this file directly is not recommended as it may be overwritten.

use std::str::FromStr;
use std::ops::DerefMut;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::borsh0_10::try_from_slice_unchecked;
use solana_program::account_info::{AccountInfo, next_account_info, next_account_infos};
use solana_program::entrypoint::ProgramResult;
use solana_program::program::{invoke, invoke_signed};
use solana_program::pubkey::Pubkey;
use solana_program::rent::Rent;
use solana_program::system_instruction::create_account;
use solana_program::{msg, system_program};
use solana_program::sysvar::Sysvar;
use solana_program::program_pack::Pack;
use crate::generated::errors::XSolError;
use crate::generated::instructions::XSolInstruction;

use crate::generated::state::{
	Account,
	AccountPDA,
	Tweet,
};
use crate::src::*;

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        data: &[u8],
    ) -> ProgramResult {
        let instruction = XSolInstruction::unpack(data)?;

        match instruction {
			XSolInstruction::AddTweet => {
				msg!("Instruction: AddTweet");
				Self::process_add_tweet(program_id, accounts)
			}
        }
    }

/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] Auto-generated, default fee payer
/// 1. `[writable, signer]` tweet_account: [Tweet] 
/// 2. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
	pub fn process_add_tweet(
		program_id: &Pubkey,
		accounts: &[AccountInfo],
	) -> ProgramResult {
		let account_info_iter = &mut accounts.iter();
		let fee_payer_info = next_account_info(account_info_iter)?;
		let tweet_account_info = next_account_info(account_info_iter)?;
		let system_program_info = next_account_info(account_info_iter)?;


		// Security Checks
		if fee_payer_info.is_signer != true {
			return Err(XSolError::InvalidSignerPermission.into());
		}

		if tweet_account_info.is_signer != true {
			return Err(XSolError::InvalidSignerPermission.into());
		}

		if *system_program_info.key != Pubkey::from_str("11111111111111111111111111111111").unwrap() {
			return Err(XSolError::NotExpectedAddress.into());
		}


		// Accounts Initializations
		if tweet_account_info.lamports() == 0 && *tweet_account_info.owner == system_program::id() {
			let space: usize = 100;
			let rent = Rent::get()?;
			let rent_minimum_balance = rent.minimum_balance(space);

			invoke(
				&create_account(
					&fee_payer_info.key,
					&tweet_account_info.key,
					rent_minimum_balance,
					space as u64,
					program_id,
				),
				&[fee_payer_info.clone(), tweet_account_info.clone()],
			)?;
		}


		// Security Checks
		if *fee_payer_info.owner != Pubkey::from_str("11111111111111111111111111111111").unwrap() {
			return Err(XSolError::WrongAccountOwner.into());
		}

		if *tweet_account_info.owner != *program_id {
			return Err(XSolError::WrongAccountOwner.into());
		}

		if tweet_account_info.data_len() != 100usize {
			return Err(XSolError::InvalidAccountLen.into());
		}


		// Accounts Deserialization
		let tweet_account = &mut Account::new(
			&tweet_account_info,
			try_from_slice_unchecked::<Tweet>(&tweet_account_info.data.borrow()).unwrap(),
		);

		// Calling STUB
		add_tweet::add_tweet(
			program_id,
			tweet_account,
		)?;

		// Accounts Serialization
		tweet_account.data.serialize(&mut &mut tweet_account_info.data.borrow_mut()[..])?;		
		Ok(())
	}
}