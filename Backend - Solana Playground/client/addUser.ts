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

function generateRandomString(n) {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
        ["bump", "u8"],
        ["seed", "String"],
        ["space", "u8"],
        ["username", "String"],
        ["owner", "String"],
        ["timestamp", "u32"],
        ["followers", "u32"],
      ],
    },
  ],
]);

const memorySchema = new Map([
  [
    Payload,
    {
      kind: "struct",
      fields: [
        ["username", "String"],
        ["owner", "String"],
        ["timestamp", "u32"],
        ["followers", "u32"],
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

let seed = generateRandomString(32);

// setup pda
let [pda, bump] = await PublicKey.findProgramAddressSync(
  [Buffer.from(seed), feePayer.publicKey.toBuffer()],
  programId
);

const kind = ProgramInstruction.AddUser;

const seedStruct = {
  username: completeStringWithSymbol("DD", "#", 32),
  owner: feePayer.publicKey.toBase58(),
  timestamp: Math.floor(Date.now() / 1000), // Timestamp in seconds, not in miliseconds (u32 limits)
  followers: 0
}
const seedMemory = new Payload(seedStruct);
const space = serialize(memorySchema, seedMemory).length
const instruction = new Payload({
  instruction: kind,
  bump,
  seed,
  space,
  ...seedStruct
});
const data = Buffer.from(serialize(payloadSchema, instruction));

console.log({
  bump,
  public_key: pda.toBase58(),
  seed,
  size: space ?? 0
})

let tx = new Transaction().add(
  new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
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