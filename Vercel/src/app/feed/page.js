"use client";

import { ExpandLess, ExpandMore, Search } from "@mui/icons-material";
import {
  completeStringWithSymbol,
  generateRandomString,
  getTimeDifference,
  modalStyle,
  modalStyleMobile,
} from "../../utils/utils";
// Styled buttons and inputs
// Solana Core modules
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { deserialize, serialize } from "borsh";
import Image from "next/image";
// NextJS modules
import Link from "next/link";
// React modules
import React, { Fragment, useCallback, useEffect, useState } from "react";
// React Toastify
import { toast } from "react-toastify";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import CancelIcon from "@mui/icons-material/Cancel";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ExploreIcon from "@mui/icons-material/Explore";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  Collapse,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Modal from "@mui/material/Modal";
import Post from "../../components/Post";
import { useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";
import { predictRudeness } from "../../actions/rudeness";
import {
  postSchema,
  addPostSchema,
  userSchema,
  addUserSchema,
  withdrawSchema,
} from "../../utils/schema";
import { findUser } from "../../utils/utils";
import FeedLayOut from "./FeedLayout";
import { useOwner } from "../../context/feedContext";
// Fonts
const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

const getRudeness = async (text) => {
  try {
    const result = await predictRudeness(text);
    return result.some((detections) => detections.value === true);
  } catch (e) {
    console.log(e);
    return false;
  }
};
export default function FeedHome() {
  const router = useRouter();

  // We use the wallet hooks to interact with the blockchain
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();

  console.log("publicKey in the feedv compoenntntntn", publicKey);
  const { pubkey } = useOwner();
  const { connection } = useConnection();
  // States and refs for the UI
  const [balance, setBalance] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [rendered, setRendered] = useState(false);
  const [loginFlag, setLoginFlag] = useState(false);
  // Post Utils
  const [posts, setPosts] = useState([]);
  // New Post Utils
  const [message, setMessage] = useState("");
  // User Utils
  const [users, setUsers] = useState([]);
  // New User Utils
  const [username, setUsername] = useState("");
  // Modal Utils
  const [loading, setLoading] = useState(false);
  let [amount, setAmount] = useState("");
  // Modal Boost
  const [openBoost, setOpenBoost] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState("");
  const handleOpenBoost = () => setOpenBoost(true);
  const handleCloseBoost = () => setOpenBoost(false);
  // Modal Tweet
  const [openPost, setOpenPost] = React.useState(false);
  const handleOpenPost = () => setOpenPost(true);
  const handleClosePost = () => setOpenPost(false);
  // Modal User
  const [openUser, setOpenUser] = React.useState(false);
  const handleOpenUser = () => setOpenUser(true);
  const handleCloseUser = () => setOpenUser(false);
  // Sort Utils
  const [openSort, setOpenSort] = React.useState(false);
  const sortHandle = () => setOpenSort(!openSort);
  // Sort Switch
  const [sortBy, setSortBy] = useState(false);

  const [visiblePosts, setVisiblePosts] = useState({});

  const toggleVisibility = (postIndex) => {
    setVisiblePosts((prev) => ({
      ...prev,
      [postIndex]: !prev[postIndex],
    }));
  };
  // Toast notification

  const transactionToast = (txhash, message) => {
    // Notification can be a component, a string or a plain object
    toast(
      <div>
        {message}:
        <br />
        <Link
          href={`https://explorer.solana.com/tx/${txhash}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {txhash}
        </Link>
      </div>
    );
  };

  // Ignore useCallback, its for performance

  // Get balance of the connected wallet
  const getBalance = useCallback(async () => {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance);
  }, [publicKey, connection]);

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
  }, [connection]);

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

  const boostPost = useCallback(async () => {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(selectedPost),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      transactionToast(signature, "Post boosted");
      handleCloseBoost();
      setTimeout(() => {
        setAmount("");
        setSelectedPost("");
        setLoading(false);
        getPosts();
        getBalance();
      }, 2000);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }, [
    publicKey,
    connection,
    amount,
    sendTransaction,
    selectedPost,
    getPosts,
    getBalance,
  ]);

  const withdrawPost = useCallback(
    async (PDA) => {
      try {
        const data = Buffer.from(serialize(withdrawSchema, { instruction: 2 }));
        let transaction = new Transaction().add(
          new TransactionInstruction({
            keys: [
              {
                pubkey: publicKey,
                isSigner: true,
                isWritable: true,
              },
              {
                pubkey: new PublicKey(PDA),
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false,
              },
            ],
            data,
            programId,
          })
        );
        const signature = await sendTransaction(transaction, connection);
        transactionToast(signature, "Withdraw from post");
        setTimeout(() => {
          getPosts();
          setSelectedPost("");
          getBalance();
        }, 2000);
      } catch (e) {
        console.log(e);
      }
    },
    [publicKey, connection, sendTransaction, getPosts, getBalance]
  );

  const addPost = useCallback(async () => {
    try {
      const seed = generateRandomString(32);

      let [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed), publicKey.toBuffer()],
        programId
      );

      const instruction = 0;

      const rudenessResult = await getRudeness(message);
      console.log(rudenessResult);

      const seedStruct = {
        owner: publicKey.toBytes(),
        parentPost: new Uint8Array(32).fill(0),
        rudeness: rudenessResult,
        cid: completeStringWithSymbol("", "~", 64),
        content: completeStringWithSymbol(message, "~", 256),
        timestamp: Math.floor(Date.now() / 1000),
      };

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

      console.log({ instruction, bump, seed, space, ...seedStruct });
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
      transactionToast(signature, "Post added");

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
  }, [publicKey, connection, sendTransaction, message, getPosts]);

  const addUser = useCallback(async () => {
    try {
      const seed = generateRandomString(32);

      let [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed), publicKey.toBuffer()],
        programId
      );

      const instruction = 3;

      const seedStruct = {
        owner: publicKey.toBytes(),
        username: completeStringWithSymbol(username, "~", 32),
        timestamp: Math.floor(Date.now() / 1000),
        followers: 0,
      };

      const space = serialize(userSchema, seedStruct).length;

      const transactionData = {
        instruction,
        bump,
        seed,
        space,
        ...seedStruct,
      };

      const encoded = serialize(addUserSchema, transactionData);

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
      transactionToast(signature, "User Created");
      handleCloseUser();
      setTimeout(() => {
        setUsername("");
        setLoading(false);
        getUsers();
      }, 2000);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [publicKey, connection, sendTransaction, username, getUsers]);

  const sortByDate = useCallback(async () => {
    let postsTemp = [...posts];
    postsTemp.sort((a, b) => b.timestamp - a.timestamp);
    setPosts(postsTemp);
  }, [setPosts, posts]);

  const sortByBalance = useCallback(async () => {
    let postsTemp = [...posts];
    postsTemp.sort((a, b) => b.balance - a.balance);
    setPosts(postsTemp);
  }, [setPosts, posts]);

  useEffect(() => {
    console.log("useeffect", publicKey);
    if (publicKey && rendered) {
     
      getBalance();
      getPosts();
      getUsers();
      setLoginFlag(true);
    } else if (!publicKey && rendered && loginFlag) {
      router.push("/");
    }
  }, [
    publicKey,
  
    getBalance,
    getPosts,
    getUsers,
    rendered,
    router,
    loginFlag,
  ]);

  useEffect(() => {
    setRendered(true);
  }, []);

  // PFP Automatic Generator based on each unique wallet on site
  const [ownerToIndexMap, setOwnerToIndexMap] = useState({});
  useEffect(() => {
    const sortedPostsforPFP = [...posts].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const map = {};
    let index = 1;
    sortedPostsforPFP.forEach((post) => {
      if (!map.hasOwnProperty(post.owner)) {
        map[post.owner] = index++;
      }
    });
    setOwnerToIndexMap(map);
  }, [posts]);

  return (
    <FeedLayOut>
      {
        // Boost Modal
      }
      <Modal
        open={openBoost}
        onClose={handleCloseBoost}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openBoost} timeout={500}>
          <Box sx={modalStyle}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  Lets boost this post
                </div>
                <div style={{ textAlign: "center", fontSize: "1.3rem" }}>
                  {selectedPost}
                </div>
                <input
                  style={{
                    alignSelf: "center",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    borderRadius: "10px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "black",
                  }}
                  placeholder="Enter amount"
                  className="searchInput"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      boostPost();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <BoltIcon
                      style={{
                        color: "white",
                        width: "2rem",
                        height: "2rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "1.2rem",
                        color: "white",
                      }}
                    >
                      Boost Post
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleCloseBoost();
                      setTimeout(() => {
                        setAmount("");
                        setSelectedPost("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "white",
                        width: "2rem",
                        height: "2rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "1.2rem",
                        color: "white",
                      }}
                    >
                      Cancel
                    </div>
                  </button>
                </div>
              </div>
            </Typography>
          </Box>
        </Fade>
      </Modal>

      <div className="scrollable-div">
        {pubkey &&
          posts.map((post, index) => {
            return (
              <Post
                pubkey={pubkey}
                ownerToIndexMap={ownerToIndexMap}
                visiblePosts={visiblePosts}
                toggleVisibility={toggleVisibility}
                setSelectedPost={setSelectedPost}
                handleOpenBoost={handleOpenBoost}
                withdrawPost={withdrawPost}
                users={users}
                post={post}
                index={index}
              />
            );
          })}
      </div>
    </FeedLayOut>
  );
}
