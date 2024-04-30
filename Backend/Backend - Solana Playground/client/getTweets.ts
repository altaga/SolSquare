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

const publicKey = new PublicKey("rafaQ56aFGU1raFoagEzCyKsQdiMUhJyCNzje6oduTv")
console.log(publicKey.toBytes().length)

const accounts = await connection.getProgramAccounts(programId,
  {
    filters: [
      {
        dataSize: 184, // number of bytes
      }
    ],
  })

let tweets = accounts.map((tweet) => { return { ...deserialize(memorySchema, Payload, tweet.account.data), addressPDA: tweet.pubkey.toBase58() } });
tweets = tweets.map((tweet) => {
  return {
    ...tweet,
    content: tweet.content.replaceAll("#", "")
  }
})

console.log(tweets)