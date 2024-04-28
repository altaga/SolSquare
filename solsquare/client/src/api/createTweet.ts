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
const Buffer = require("buffer").Buffer;
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
const programId = new PublicKey("5qx1gsC29htjX9yTKvndnEYE4siBGZ1D8vvGiU3AhvLi");

// connection
const connection = new Connection(clusterApiUrl("devnet"));

// Example Private Key, this account had 10 solana devnet for testing
const feePayer = Keypair.fromSecretKey(
  bs58.decode(
    "4zspfaFA1MvNdRwmZLDDhMJfmB7r3DQ1Zfd3qNNLPgQPzjrZtCsbyPccuvJKyfdLiY8Rbay3QUKGET9GJnC7fGw1"
  )
);

// Utils

function generateRandomString(n: number) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function completeStringWithSymbol(
  inputString: string | any[],
  symbol: string,
  desiredLength: number
) {
  const currentLength = inputString.length;
  if (currentLength >= desiredLength) {
    return inputString;
  }
  const remainingLength = desiredLength - currentLength;
  const symbolsToAdd = symbol.repeat(remainingLength);
  return inputString + symbolsToAdd;
}

// Main code

export const create = async (content: any) => {
  const seed = generateRandomString(32);

  let [pda, bump] = await PublicKey.findProgramAddressSync(
    [seed, feePayer.publicKey.toBuffer()],
    programId
  );

  const instruction = ProgramInstruction.AddTweet;

  const seedStruct = {
    content: completeStringWithSymbol(content, "#", 128),
    owner: feePayer.publicKey.toBase58(),
    timestamp: Math.floor(Date.now() / 1000),
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

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(tx),
    [feePayer]
  );

  return transactionSignature;
};
