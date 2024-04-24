// This file is auto-generated from the CIDL source.
// Editing this file directly is not recommended as it may be overwritten.

import * as pda from "./pda";
import * as T from "./types";
import {
    Commitment,
    Connection,
    GetAccountInfoConfig,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    TransactionSignature,
} from "@solana/web3.js";
import {deserialize, serialize} from "borsh";


let _programId: PublicKey;
let _connection: Connection;

export const initializeClient = (
    programId: PublicKey,
    connection: Connection
) => {
    _programId = programId;
    _connection = connection;
};

export enum XSolInstruction {
/**
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[writable, signer]` tweet_account: {@link Tweet} 
 * 2. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 */
    AddTweet = 0,
}

export type AddTweetArgs = {
	feePayer: PublicKey;
	tweetAccount: PublicKey;
};

/**
 * ### Returns a {@link TransactionInstruction}
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[writable, signer]` tweet_account: {@link Tweet} 
 * 2. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 */
export const addTweet = (args: AddTweetArgs, remainingAccounts: Array<PublicKey> = []): TransactionInstruction => {
		const data = serialize(
        {
            struct: {
                id: "u8",

            },
        },
        {
            id: XSolInstruction.AddTweet,

        }
    );



    return new TransactionInstruction({
        data: Buffer.from(data),
        keys: [
						{pubkey: args.feePayer, isSigner: true, isWritable: true},
						{pubkey: args.tweetAccount, isSigner: true, isWritable: true},
						{pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false},
            ...remainingAccounts.map(e => ({pubkey: e, isSigner: false, isWritable: false})),
        ],
        programId: _programId,
    });
};

/**
 * ### Returns a {@link TransactionSignature}
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[writable, signer]` tweet_account: {@link Tweet} 
 * 2. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 */
export const addTweetSendAndConfirm = async (
	args: Omit<AddTweetArgs, "feePayer" | "tweetAccount"> & {
	  signers: {
			feePayer: Keypair,
			tweetAccount: Keypair,
	  }
  }, 
  remainingAccounts: Array<PublicKey> = []
): Promise<TransactionSignature> => {
  const trx = new Transaction();


	trx.add(addTweet({
		...args,
		feePayer: args.signers.feePayer.publicKey,
		tweetAccount: args.signers.tweetAccount.publicKey,
	}, remainingAccounts));

  return await sendAndConfirmTransaction(
    _connection,
    trx,
    [
				args.signers.feePayer,
				args.signers.tweetAccount,
    ]
  );
};

// Getters

export const getTweet = async (
    publicKey: PublicKey,
    commitmentOrConfig: Commitment | GetAccountInfoConfig | undefined = "processed"
): Promise<T.Tweet | undefined> => {
    const buffer = await _connection.getAccountInfo(publicKey, commitmentOrConfig);

    if (!buffer) {
        return undefined
    }

    if (buffer.data.length <= 0) {
        return undefined
    }

    return T.decodeTweet(deserialize(T.TweetSchema, buffer.data) as Record<string, unknown>);
}


// Websocket Events

