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