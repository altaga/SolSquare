use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::pubkey::Pubkey;

use crate::generated::state::{
	Account,
	Tweet,
};


/// Accounts:
/// 0. `[writable, signer]` fee_payer: [AccountInfo] Auto-generated, default fee payer
/// 1. `[writable, signer]` tweet_account: [Tweet] 
/// 2. `[]` system_program: [AccountInfo] Auto-generated, for account initialization
pub fn add_tweet(
	program_id: &Pubkey,
	tweet_account: &mut Account<Tweet>,
) -> ProgramResult {
    // Implement your business logic here...
    tweet_account.data.text = "test txt".to_string();
    Ok(())
}