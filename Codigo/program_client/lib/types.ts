// This file is auto-generated from the CIDL source.
// Editing this file directly is not recommended as it may be overwritten.

import type {Schema} from 'borsh';
import type {Decoded} from "./utils";
import {PublicKey} from "@solana/web3.js";
import { deserialize } from "borsh";

export interface Tweet {
  text: string;
  creator: PublicKey;
}

export const decodeTweet = (decoded: Decoded): Tweet => ({
    text: decoded["text"] as string,
    creator: new PublicKey(decoded["creator"] as Uint8Array),
});

export const TweetSchema: Schema =  {
    struct: {
        text: "string",
        creator: { array: { type: "u8", len: 32 } },
    }
};



