// React Format uncomment on React
const { Connection, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const { deserialize } = require("borsh");


const tweetSchema = {
  struct: { content: "string", owner: "string", timestamp: "u32" },
};

export const getTweet = async () => {
  // program id
  const programId = new PublicKey(
    "5qx1gsC29htjX9yTKvndnEYE4siBGZ1D8vvGiU3AhvLi"
  );

  // connection
  const connection = new Connection(clusterApiUrl("devnet"));

  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      {
        dataSize: 184, // number of bytes
      },
    ],
  });

  let tweets = accounts.map((tweet:any) =>
    deserialize(tweetSchema, tweet.account.data)
  );
  tweets = tweets.map((tweet:any) => {
    return {
      ...tweet,
      content: tweet.content.replaceAll("#", ""),
    };
  });

  return tweets;
};
