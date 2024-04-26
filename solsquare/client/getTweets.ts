import { deserialize } from "borsh";
import { Buffer } from "buffer";
import {
  PublicKey,
} from "@solana/web3.js";

class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

class Payload extends Assignable { }

const memorySchema = new Map([
  [
    Payload,
    {
      kind: "struct",
      fields: [
        ["content", "String"],
        ["owner", "String"]
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

const accounts = await connection.getProgramAccounts(programId,
  {
    filters: [
      {
        dataSize: 116, // number of bytes
      }
    ],
  })

let tweets = accounts.map((tweet) => deserialize(memorySchema, Payload, tweet.account.data));
tweets = tweets.map((tweet) => {
  return {
    ...tweet,
    content: tweet.content.replaceAll("#","")
  }
})

console.log(tweets)
