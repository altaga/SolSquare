# SOLSQUARE BACKEND

## How to Build

1. Go to the solsquare folder.
2. Run `cargo build-bpf`

## How to deploy

1. Install the [solana-cli](https://docs.solanalabs.com/cli/install)
2. Configure it to use **devnet** -> `solana config set --url devnet
   `
3. Run `solana program deploy target/deploy/sol_square.so`
4. Once the program is deployed, keep track of the programId which should be used to se the `NEXT_PUBLIC_PROGRAM_ID`environment variable in the Frontend