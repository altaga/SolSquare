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

const accounts = await connection.getProgramAccounts(programId,
  {
    filters: [
      {
        dataSize: 92, // number of bytes
      }
    ],
  })
console.log(accounts.map((user) => user.pubkey.toBase58()))
let users = accounts.map((user) => { return { ...deserialize(memorySchema, Payload, user.account.data), addressPDA: user.pubkey.toBase58() } });
users = users.map((user) => {
  return {
    ...user,
    username: user.username.replaceAll("#", ""),
  }
})

console.log(users)