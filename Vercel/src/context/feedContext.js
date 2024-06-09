"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { userSchema, postSchema, addPostSchema } from "../utils/schema";
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { completeStringWithSymbol, generateRandomString } from "../utils/utils";
import { deserialize, serialize } from "borsh";
import TransactionToast from "../components/TransactionToast";
import { predictRudeness } from "../actions/rudeness";
import { useRouter } from "next/navigation";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

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

const tokenAddress = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_ADDRESS);
const tokenAddressAuthority = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS_AUTH
);

const OwnerContext = createContext();

export const OwnerProvider = ({ children }) => {
  const router = useRouter();
  const [ownerToIndexMap, setOwnerToIndexMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [users, setUsers] = useState([]);
  const [openPost, setOpenPost] = useState(false);

  const { connection } = useConnection();
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [pubkey, setPubkey] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [posts, setFilteredPosts] = useState([]);
  const [allPosts, setPosts] = useState([]);
  const [backupPosts, setBackupPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [parentPost, setParentPost] = useState(null);
  const [parentPostData, setParentPostData] = useState(null);

  const [singlePostPage, setSinglePostPage] = useState(false);
  const handleOpenPost = () => setOpenPost(true);
  const handleClosePost = () => setOpenPost(false);
  const { publicKey, sendTransaction } = useWallet();

  const getBalance = useCallback(async () => {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance);
  }, [publicKey, connection]);

  useEffect(() => {
    setFilteredPosts([]);
    if (searchValue) {
      console.log("all data ", backupPosts);
      const tempData = backupPosts.filter(
        (post) =>
          post.content.toLowerCase().indexOf(searchValue.toLowerCase()) != -1 ||
          post.owner.toLowerCase().indexOf(searchValue.toLowerCase()) != -1
        // ||
        //   post.addressPDA.toLowerCase().includes(searchValue.toLowerCase())
      );
      console.log("tempData data ", tempData);
      setFilteredPosts(tempData);

    } else {
      console.log("all data1 ", allPosts);
      console.log("all data1323 ", backupPosts);
      setFilteredPosts(backupPosts);
      
    }

    console.log("backupPosts ", backupPosts);

    }, [backupPosts, searchValue]);

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

  const getPosts = useCallback(
    async (parentData) => {
      let filter = [
        {
          dataSize: 397, // number of bytes
        },
      ];

      if (parentData) {
        filter.push({
          memcmp: {
            offset: 32,
            bytes: new PublicKey(parentData?.addressPDA).toString(),
          },
        });
      }

      const accounts = await connection.getProgramAccounts(programId, {
        filters: filter,
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

      posts = await Promise.all(
        posts.map(async (post) => {
          const OWNER = new PublicKey(post.addressPDA);
          const [address] = PublicKey.findProgramAddressSync(
            [
              OWNER.toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              tokenAddress.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          let bonkBalance;
          try {
            bonkBalance = await connection.getTokenAccountBalance(address);
            bonkBalance = bonkBalance.value.uiAmount;
          } catch (e) {
            bonkBalance = 0;
          }
          return {
            ...post,
            bonkBalance,
            content: post.content.replaceAll("~", ""),
            owner: new PublicKey(post.owner).toBase58(),
          };
        })
      );

      if (!parentData) {
        setParentPostData(null);
      }

      posts.sort((a, b) => b.bonkBalance - a.bonkBalance);

      setPosts(posts);
      setBackupPosts(posts);
    },
    [connection]
  );

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

       
        let parentPostPDA = new Uint8Array(32).fill(0);
        if (singlePostPage && parentPost) {
          parentPostPDA = new PublicKey(parentPost).toBytes();
        }
        const seedStruct = {
          owner: publicKey.toBytes(),
          parentPost: parentPostPDA,
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
    [publicKey, connection, sendTransaction, getPosts, singlePostPage]
  );

  const getMainPDAInfo = useCallback(
    async (addressPDA) => {
      const mainAccount = await connection.getAccountInfo(
        new PublicKey(addressPDA)
      );

      let post = {
        ...deserialize(postSchema, mainAccount.data),
        addressPDA: new PublicKey(addressPDA),
        balance: 0,
      };
      post = {
        ...post,
        content: post.content.replaceAll("~", ""),
        owner: new PublicKey(post.owner).toBase58(),
      };
      setParentPostData(post);
      getPosts(post);
    },
    [connection]
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
        parentPostData,
        setParentPostData,
        setSinglePostPage,
        setSearchValue,
        searchValue,
        getMainPDAInfo,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => {
  return useContext(OwnerContext);
};
