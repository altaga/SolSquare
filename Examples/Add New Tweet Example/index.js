// React Format uncomment on React
//import { Connection, clusterApiUrl } from "@solana/web3.js";
//import { deserialize } from "borsh";
//import bs58 from "bs58";

// Comment this on react
const {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const { serialize } = require("borsh");
const bs58 = require("bs58");

// Constants and Variables

const tweetSchema = {
  struct: { content: "string", owner: "string", timestamp: "u32" },
};

const payloadSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u8",
    content: "string",
    owner: "string",
    timestamp: "u32",
  },
};

const ProgramInstruction = {
  AddTweet: 0,
  ModifyTweet: 1,
};

// program id
const programId = new PublicKey("7GTHRrqPjABFdUPmdPAmiaqdhJ162cAg1mTXTY5z9Y7D");

// connection
const connection = new Connection(clusterApiUrl("devnet"));

// Example Private Key, this account had 10 solana devnet for testing
const feePayer = Keypair.fromSecretKey(
  bs58.decode(
    "4zspfaFA1MvNdRwmZLDDhMJfmB7r3DQ1Zfd3qNNLPgQPzjrZtCsbyPccuvJKyfdLiY8Rbay3QUKGET9GJnC7fGw1"
  )
);
console.log(feePayer.publicKey.toString());

// Utils

function generateRandomString(n) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
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

// Main code

async function main() {
  const seed = generateRandomString(32);
  let [pda, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from(seed), feePayer.publicKey.toBuffer()],
    programId
  );

  const instruction = ProgramInstruction.AddTweet;

  const seedStruct = {
    content: completeStringWithSymbol("Hello this is a tweet", "#", 128),
    owner: feePayer.publicKey.toBase58(),
    timestamp: Math.floor(Date.now() / 1000), // Timestamp in seconds, not in miliseconds (u32 limits)
  };

  const space = serialize(tweetSchema, seedStruct).length;

  const transactionData = {
    instruction,
    bump,
    seed,
    space,
    ...seedStruct,
  };

  const encoded = serialize(payloadSchema, transactionData);

  const data = Buffer.from(encoded);
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
      programId,
    })
  );

  // Send Solana Transaction
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(tx),
    [feePayer]
  );

  console.log(
    "Explorer = ",
    `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

main();
