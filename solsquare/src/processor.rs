use crate::state::{TweetData, TweetDataBorsh, TweetDataMod, TweetDataModBorsh, UserData, UserDataBorsh, UserDataMod, UserDataModBorsh};

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

pub fn create_tweet_data_mod(payload:TweetDataModBorsh) -> TweetDataMod{
    TweetDataMod {
        content: payload.content,
        owner: payload.owner,
        timestamp:payload.timestamp
    }
}

pub fn create_user_data(payload:UserDataBorsh) -> UserData{
    UserData {
        bump:payload.bump,
        seed:payload.seed,
        space:payload.space,
        username:payload.username,
        owner: payload.owner,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}

pub fn create_user_data_mod(payload:UserDataModBorsh) -> UserDataMod{
    UserDataMod {
        username:payload.username,
        owner: payload.owner,
        timestamp:payload.timestamp,
        followers:payload.followers,
    }
}