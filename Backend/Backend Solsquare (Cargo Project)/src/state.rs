// Tweet Data Processing

use borsh::{BorshDeserialize, BorshSerialize};

#[derive(Debug)]
pub struct TweetData {
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u16,
    pub(crate) owner: [u8; 32],
    pub(crate) parentPost: [u8; 32],
    pub(crate) rudeness: bool,
    pub(crate) cid: String,
    pub(crate) content:String,
    pub(crate) timestamp:u32
}
#[derive(BorshDeserialize)]
pub struct TweetDataBorsh {
    _instruction:u8,
    bump:u8,
    seed:String,
    space:u16,
    owner: [u8; 32],
    parentPost: [u8; 32],
    rudeness: bool,
    cid: String,
    content:String,
    timestamp:u32
}
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetPDADataBorsh {
    pub(crate) owner: [u8; 32],
    pub(crate) parentPost: [u8; 32],
    pub(crate) rudeness: bool,
    pub(crate) cid: String,
    pub(crate) content:String,
    pub(crate) timestamp:u32
}

pub fn create_tweet_data(payload:TweetDataBorsh) -> TweetData{
    TweetData {
        bump:payload.bump,
        seed:payload.seed,
        space:payload.space,
        owner: payload.owner,
        parentPost:  payload.parentPost,
        rudeness: payload.rudeness,
        cid: payload.cid,
        content:payload.content,
        timestamp:payload.timestamp
    }
}


#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct TweetDataMod {
    pub(crate) owner: [u8; 32],
    pub(crate) parentPost: [u8; 32],
    pub(crate) rudeness: bool,
    pub(crate) cid: String,
    pub(crate) content:String,
    pub(crate) timestamp:u32
}

#[derive(BorshDeserialize)]
pub struct TweetDataModBorsh {
    _instruction:u8,
    owner: [u8; 32],
    parentPost: [u8; 32],
    rudeness: bool,
    cid: String,
    content:String,
    timestamp:u32
}

pub fn create_tweet_data_mod(payload:TweetDataModBorsh) -> TweetDataMod{
    TweetDataMod {
        content: payload.content,
        owner: payload.owner,
        timestamp:payload.timestamp,
        parentPost: payload.parentPost,
        cid: payload.cid,
        rudeness: payload.rudeness,
    }
}


#[derive(Debug)]
pub struct UserData {
    pub(crate) bump:u8,
    pub(crate) seed:String,
    pub(crate) space:u16,
    pub(crate) owner: [u8; 32],
    pub(crate) username:String,
    pub(crate) timestamp: u32,
    pub(crate) followers:u32
}

#[derive(BorshDeserialize)]
pub struct UserDataBorsh {
    _instruction:u8,
    bump:u8,
    seed:String,
    space:u16,
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
    _instruction:u8,
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
