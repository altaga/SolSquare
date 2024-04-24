# Encode-Solana-Decentralized-Twitter

<img src="https://i.ibb.co/0tfV7NF/image.png">

 Encode Main Repo for Solana-Decentralized-Twitter

## Local Deployment

1. Start a local validator by running `solana-test-validator`.
2. Go to the `program` folder and run `cargo build-sbf`
2. Run `solana program deploy target/deploy/x_sol.so`. This will deploy the program on-chain.
3. Save the program Id returned by the deploy command.

## Testing Locally

1. Start a local validator by running `solana-test-validator`.
2. Run `solana logs` on a separate terminal to keep track of interactions with the local validator.
2. Go to the `program_client` folder and run `npm install`
2. Now run `npm install --save-dev ts-node`. This will install the TypeScript execution engine.
3. Use the program Id returned by the `deploy` command to set the `progId` constant in the `app.ts` file.
4. Run `npx ts-node app.ts`. This will trigger the transaction that creates a new tweet.
5. Check the logs terminal to see all interactions with the validator.
