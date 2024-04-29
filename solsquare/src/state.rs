use borsh::{BorshDeserialize, BorshSerialize};
#[derive(Debug)]
pub struct TweetData {
    pub bump:u8,
    pub seed:String,
    pub space:u8,
    pub content:String,
    pub owner: String,
    pub timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataBorsh {
    pub instruction:u8,
    pub bump:u8,
    pub seed:String,
    pub space:u8,
    pub content:String,
    pub owner: String,
    pub timestamp:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetPDADataBorsh {
    pub content:String,
    pub owner: String,
    pub timestamp:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetDataMod {
    pub content:String,
    pub owner: [u8; 32],
    pub timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataModBorsh {
    pub instruction:u8,
    pub content:String,
    pub owner: [u8; 32],
    pub timestamp:u32
}

#[derive(Debug)]
pub struct UserData {
    pub bump:u8,
    pub seed:String,
    pub space:u8,
    pub username:String,
    pub owner: [u8; 32],
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataBorsh {
    instruction:u8,
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u8,
    pub(crate) username:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserPDADataBorsh {
    pub(crate) username:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserDataMod {
    pub(crate) username:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataModBorsh {
    instruction:u8,
    pub(crate) username:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}