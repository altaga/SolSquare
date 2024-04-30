import { serialize } from "borsh";
import { Buffer } from "buffer";
import {
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";


function completeStringWithSymbol(inputString, symbol, desiredLength) {
  const currentLength = inputString.length;
  if (currentLength >= desiredLength) {
    return inputString;
  }
  const remainingLength = desiredLength - currentLength;
  const symbolsToAdd = symbol.repeat(remainingLength);
  return inputString + symbolsToAdd;
}

enum ProgramInstruction {
  AddTweet = 0,
  ModifyTweet,
  TransferFunds,
  AddUser,
  ModifyUser
}

class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

class Payload extends Assignable { }

const payloadSchema = new Map([
  [
    Payload,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["content", "String"],
        ["owner", "String"],
        ["timestamp", "u32"]
      ],
    },
  ],
]);


// Check

// program id
const programId = pg.PROGRAM_ID

// connection
const connection = pg.connection

// setup fee payer
const feePayer = pg.wallet.keypair

const pda = new PublicKey("5xxZNasSHjEtSSedjcWvXyyiuYdL9yFya85LzRXKN7b4")

const kind = ProgramInstruction.ModifyTweet;

const seedStruct = {
  content: completeStringWithSymbol("Hello from SOLSQUARE", "#", 128),
  owner: feePayer.publicKey.toBase58(),
  timestamp: Math.floor(Date.now() / 1000) // Timestamp in seconds, not in miliseconds (u32 limits)
}
const instruction = new Payload({
  instruction: kind,
  ...seedStruct
});
const data = Buffer.from(serialize(payloadSchema, instruction));

let tx = new Transaction().add(
  new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      }
    ],
    data,
    programId
  })
);

// Send Solana Transaction
const transactionSignature = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(tx),
  [feePayer]
);

console.log("Explorer = ", `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);


const accounts = await connection.getProgramAccounts(programId);

console.log(`Accounts for program ${programId.toBase58()}: `);
console.log(accounts.map((item) => item.pubkey.toBase58()));