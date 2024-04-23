// This file is auto-generated from the CIDL source.
// Editing this file directly is not recommended as it may be overwritten.

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use crate::generated::errors::XSolError;

#[derive(BorshSerialize, Debug)]
pub enum XSolInstruction {
/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] Auto-generated, default fee payer
/// 1. `[writable, signer]` tweet_account: [Tweet] 
/// 2. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
	AddTweet,

}

impl XSolInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(XSolError::InvalidInstruction)?;

        Ok(match variant {
			0 => Self::AddTweet,
			_ => return Err(XSolError::InvalidInstruction.into())
        })
    }
}