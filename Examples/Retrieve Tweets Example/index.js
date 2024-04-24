// React Format uncomment on React
//import { Connection, clusterApiUrl } from "@solana/web3.js";
//import { deserialize } from "borsh";

// Comment this on react
const { Connection, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const { deserialize } = require("borsh");

const tweetSchema = {
  struct: { content: "string", owner: "string", timestamp: "u32" },
};

// program id
const programId = new PublicKey("7GTHRrqPjABFdUPmdPAmiaqdhJ162cAg1mTXTY5z9Y7D");

// connection
const connection = new Connection(clusterApiUrl("devnet"));

async function main() {
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      {
        dataSize: 184, // number of bytes
      },
    ],
  });

  let tweets = accounts.map((tweet) =>
    deserialize(tweetSchema, tweet.account.data)
  );
  tweets = tweets.map((tweet) => {
    return {
      ...tweet,
      content: tweet.content.replaceAll("#", ""),
    };
  });

  console.log(tweets);
}

main();
