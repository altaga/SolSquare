// Tweet Data Processing

use borsh::{BorshDeserialize, BorshSerialize};

#[derive(Debug)]
pub struct TweetData {
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u8,
    pub(crate) content:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataBorsh {
    instruction:u8,
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u8,
    pub(crate) content:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetPDADataBorsh {
    pub(crate) content:String,
    pub(crate) owner: [u8; 32],
    pub(crate) timestamp:u32
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


#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetDataMod {
    pub(crate) owner: [u8; 32],
    pub(crate) parent_post: [u8; 32],
    pub(crate) cid: String,
    pub(crate) content:String,
    pub(crate) rudeness: bool,
    pub(crate) timestamp:u32

}

#[derive(BorshDeserialize)]
pub struct TweetDataModBorsh {
    instruction:u8,
    content:String,
    owner: [u8; 32],
    timestamp:u32,
    parent_post: [u8; 32],
    cid: String,
    rudeness: bool

}

pub fn create_tweet_data_mod(payload:TweetDataModBorsh) -> TweetDataMod{
    TweetDataMod {
        content: payload.content,
        owner: payload.owner,
        timestamp:payload.timestamp,
        parent_post: payload.parent_post,
        cid: payload.cid,
        rudeness: payload.rudeness,
    }
}


#[derive(Debug)]
pub struct UserData {
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u8,
    pub(crate) owner: [u8; 32],
    pub(crate) username:String,
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataBorsh {
    instruction:u8,
    bump:u8,
    seed:String,
    space:u8,
    owner: [u8; 32],
    username:String,
    timestamp: u32,
    followers:u32
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserPDADataBorsh {
    pub(crate) owner: [u8; 32],
    pub(crate) username:String,
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

pub fn create_user_data(payload:UserDataBorsh) -> UserData{
    UserData {
        bump:payload.bump,
        seed:payload.seed,
        space:payload.space,
        owner: payload.owner,
        username:payload.username,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}


#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct UserDataMod {
    pub(crate) owner: [u8; 32],
    pub(crate) username:String,
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataModBorsh {
    instruction:u8,
    owner: [u8; 32],
    username:String,
    timestamp: u32,
    followers:u32
}

pub fn create_user_data_mod(payload:UserDataModBorsh) -> UserDataMod{
    UserDataMod {
        owner: payload.owner,
        username:payload.username,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}
