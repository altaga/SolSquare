use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

use crate::processor::create_tweet_data;
use crate::state::{TweetData, TweetDataBorsh};

// Card Enum Settings

pub enum ProgramInstruction {
    AddTweet(TweetData),
    ModifyTweet(TweetData),
    TransferFunds()
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
            2 => {
                Self::TransferFunds()
            }
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}