"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  userSchema,

  postSchema,
  addPostSchema,
} from "../utils/schema";
import {

  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  completeStringWithSymbol,
  generateRandomString,

} from "../utils/utils";
import { deserialize, serialize } from "borsh";
import TransactionToast from "../components/TransactionToast";
import { predictRudeness } from "../actions/rudeness";
import { useRouter } from "next/navigation";
const getRudeness = async (text) => {
  try {
    const result = await predictRudeness(text);
    return result.some((detections) => detections.value === true);
  } catch (e) {
    console.log(e);
    return false;
  }
};

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

const OwnerContext = createContext();

export const OwnerProvider = ({ children }) => {
  const router = useRouter();
  const [ownerToIndexMap, setOwnerToIndexMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [openPost, setOpenPost] = useState(false);

  const { connection } = useConnection();
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [pubkey, setPubkey] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [parentPost, setParentPost] = useState(null);
  const handleOpenPost = () => setOpenPost(true);
  const handleClosePost = () => setOpenPost(false);
  const { publicKey, sendTransaction } =
    useWallet();

  const getBalance = useCallback(async () => {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance);
  }, [publicKey, connection]);

  const getUsers = useCallback(async () => {
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 76, // number of bytes
        },
      ],
    });
    let users = accounts.map((user) => {
      return {
        ...deserialize(userSchema, user.account.data),
        addressPDA: user.pubkey.toBase58(),
        balance: user.account.lamports,
      };
    });
    users = users.map((user) => {
      return {
        ...user,
        username: user.username.replaceAll("~", ""),
        owner: new PublicKey(user.owner).toBase58(),
      };
    });
    setUsers(users);
  }, [connection]);

  const getPosts = useCallback(async () => {
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 397, // number of bytes
        },
      ],
    });
    let posts = accounts.map((post) => {
      return {
        ...deserialize(postSchema, post.account.data),
        addressPDA: post.pubkey.toBase58(),
        balance: post.account.lamports,
      };
    });
    posts = posts.map((post) => {
      return {
        ...post,
        content: post.content.replaceAll("~", ""),
        owner: new PublicKey(post.owner).toBase58(),
      };
    });

    posts.sort((a, b) => b.balance - a.balance);

    setPosts(posts);
  }, [connection, router]);

  const addPost = useCallback(
    async (text) => {
      try {
        const seed = generateRandomString(32);

        let [pda, bump] = PublicKey.findProgramAddressSync(
          [Buffer.from(seed), publicKey.toBuffer()],
          programId
        );

        const instruction = 0;

        const rudenessResult = await getRudeness(text);

        const seedStruct = {
          owner: publicKey.toBytes(),
          parentPost: parentPost
            ? Buffer.from(parentPost, "base64").slice(0, 32)
            : new Uint8Array(32).fill(0),
          rudeness: rudenessResult,
          cid: completeStringWithSymbol("", "~", 64),
          content: completeStringWithSymbol(text, "~", 256),
          timestamp: Math.floor(Date.now() / 1000),
        };

        console.log(seedStruct);
        const space = serialize(postSchema, seedStruct).length;

        const transactionData = {
          instruction,
          bump,
          seed,
          space,
          ...seedStruct,
        };

        const encoded = serialize(addPostSchema, transactionData);

        const data = Buffer.from(encoded);

        let transaction = new Transaction().add(
          new TransactionInstruction({
            keys: [
              {
                pubkey: publicKey,
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

        const signature = await sendTransaction(transaction, connection);
        TransactionToast(signature, "Post added");

        handleClosePost();
        setTimeout(() => {
          getPosts();
          setMessage("");
          setLoading(false);
        }, 2000);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    },
    [publicKey, connection, sendTransaction, getPosts]
  );
  return (
    <OwnerContext.Provider
      value={{
        ownerToIndexMap,
        setOwnerToIndexMap,
        loading,
        setLoading,
        users,
        setUsers,
        connection,
        getUsers,
        balance,
        getBalance,
        rendered,
        setRendered,
        setPubkey,
        pubkey,
        getPosts,
        posts,
        addPost,
        setMessage,
        message,
        handleOpenPost,
        handleClosePost,
        openPost,
        setOpenPost,
        setPosts,
        setParentPost,
        parentPost,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => {
  return useContext(OwnerContext);
};
