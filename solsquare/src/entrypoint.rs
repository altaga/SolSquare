use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::{entrypoint, msg};
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use crate::instructions::ProgramInstruction;
// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Entry Point

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer {
        return Err(ProgramError::IllegalOwner);
    }

    let instruction = ProgramInstruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        ProgramInstruction::AddTweet(x) => {
            msg!("Add Tweet");
            crate::processor::create_tweet(program_id, accounts, x)?;
        },
        ProgramInstruction::ModifyTweet(x) => {
            msg!("Modify Tweet");
            crate::processor::modify_tweet(program_id, accounts, x)?;
        }
        ProgramInstruction::TransferFunds() => {
            msg!("Transfer Funds");
            crate::function::transfer_funds(accounts)?;
        }
    }
    Ok(())
}