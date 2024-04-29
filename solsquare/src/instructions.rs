use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

use crate::processor::{create_tweet_data, create_tweet_data_mod, create_user_data, create_user_data_mod};
use crate::state::{TweetData, TweetDataBorsh, TweetDataMod, TweetDataModBorsh, UserData, UserDataBorsh, UserDataMod, UserDataModBorsh};

// Card Enum Settings

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
            }
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