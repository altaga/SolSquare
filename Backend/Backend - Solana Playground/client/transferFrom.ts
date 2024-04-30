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

const kind = ProgramInstruction.TransferFunds;

const pda = new PublicKey("2oeK1w4uaqfWoRTai5dyVQ7b5iK454zTYwv9Dv2DspCQ")

const instruction = new Payload({
  instruction: kind,
});
const data = Buffer.from(serialize(payloadSchema, instruction));

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
    ],
    data,
    programId
  })
);

let pdaBalance = await connection.getBalance(pda);
let ownerBalance = await connection.getBalance(feePayer.publicKey);

console.log({
  pdaBalance,
  ownerBalance
})

// Send Solana Transaction
const transactionSignature = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(tx),
  [feePayer]
);

pdaBalance = await connection.getBalance(pda);
ownerBalance = await connection.getBalance(feePayer.publicKey);

console.log({
  pdaBalance,
  ownerBalance
})

console.log("Explorer = ", `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);


const accounts = await connection.getProgramAccounts(programId);

console.log(`Accounts for program ${programId.toBase58()}: `);
console.log(accounts.map((item) => item.pubkey.toBase58()));