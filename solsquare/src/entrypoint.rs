use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::{entrypoint, msg};
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use crate::create_user::create_user;
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
            crate::add_tweet::add(program_id, accounts, x)?;
        },
        ProgramInstruction::ModifyTweet(x) => {
            msg!("Modify Tweet");
            crate::modify_tweet::edit(accounts, x)?;
        },
        ProgramInstruction::TransferFunds() => {
            msg!("Transfer Funds");
            crate::funds::transfer_funds(accounts)?;
        },
        ProgramInstruction::AddUser(x) => {
            msg!("Add User");
            create_user(program_id, accounts, x)?;
        },
        ProgramInstruction::ModifyUser(x) => {
            msg!("Modify User");
            crate::modify_user::modify_user( accounts, x)?;
        },
    }
    Ok(())
}