"use client";

import { ExpandLess, ExpandMore, Search } from "@mui/icons-material";
import {
  completeStringWithSymbol,
  generateRandomString,
  getTimeDifference,
  modalStyle,
  modalStyleMobile,
} from "../../../utils/utils";
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

import { useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";



// Fonts
const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

// Schemas Post

const postSchema = {
  struct: {
    content: "string",
    owner: { array: { type: "u8", len: 32 } },
    timestamp: "u32",
  },
};

const addPostSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u8",
    content: "string",
    owner: { array: { type: "u8", len: 32 } },
    timestamp: "u32",
  },
};

// User Schemas

const userSchema = {
  struct: {
    owner: { array: { type: "u8", len: 32 } },
    username: "string",
    timestamp: "u32",
    followers: "u32",
  },
};

const addUserSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u8",
    owner: { array: { type: "u8", len: 32 } },
    username: "string",
    timestamp: "u32",
    followers: "u32",
  },
};

// Instruction Schemas

const withdrawSchema = {
  struct: { instruction: "u8" },
};

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

// Utils

function findUser(users, owner) {
  try {
    for (let i = 0; i < users.length; i++) {
      if (users[i].owner === owner) {
        return users[i].username;
      }
    }
    return owner;
  } catch (e) {
    console.log(e);
    return owner;
  }
}

function findFollowers(users, owner) {
  try {
    for (let i = 0; i < users.length; i++) {
      if (users[i].owner === owner) {
        return users[i].followers;
      }
    }
    return 0;
  } catch (e) {
    return 0;
  }
}


export default function FeedHome({ params }) {
  const user = params.user;
  const router = useRouter();
  // Detect if device has a touch screen, then a mobile device, its not perfect, but it simplifies the code
  const isTouchScreen =
    ("ontouchstart" in window || navigator.msMaxTouchPoints) ?? false;
  console.log(isTouchScreen);
  // We use the wallet hooks to interact with the blockchain
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();
  const [pubkey, setPubkey] = useState(null);
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
          dataSize: 168, // number of bytes
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
        content: post.content.replaceAll("#", ""),
        owner: new PublicKey(post.owner).toBase58(),
      };
    });
    posts = posts.filter((post) => post.owner == user);
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
        username: user.username.replaceAll("#", ""),
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

      const seedStruct = {
        content: completeStringWithSymbol(message, "#", 128),
        owner: publicKey.toBytes(),
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
        username: completeStringWithSymbol(username, "#", 32),
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
    if (publicKey && rendered) {
      setPubkey(publicKey);
      getBalance();
      getPosts();
      getUsers();
      setLoginFlag(true);
    } else if (!publicKey && rendered && loginFlag) {
      router.push("/");
    }
  }, [
    publicKey,
    setPubkey,
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

  return isTouchScreen ? (
    <React.Fragment>
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
          <Box sx={modalStyleMobile}>
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
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "1.3rem",
                    marginBottom: "30px",
                  }}
                >
                  Lets boost this post
                </div>
                <div style={{ textAlign: "center", fontSize: "1.2rem" }}>
                  {selectedPost.substring(0, 22)}
                  <br />
                  {selectedPost.substring(22)}
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
                        color: "#30ceb7",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
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
                        color: "red",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
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
      {
        // Post Modal
      }
      <Modal
        open={openPost}
        onClose={handleClosePost}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openPost} timeout={500}>
          <Box sx={modalStyleMobile}>
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
                  Create New Post
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
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
                    placeholder="Enter post message"
                    className="searchInput"
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length >= 128) {
                        setMessage(e.target.value.substring(0, 128));
                      }
                      if (e.target.value.length < 128) {
                        setMessage(e.target.value);
                      }
                    }}
                  />
                  <div>{`${128 - message.length}`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addPost();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <AddCircleIcon
                      style={{
                        color: "#30ceb7",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
                        color: "white",
                      }}
                    >
                      Add Post
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleClosePost();
                      setTimeout(() => {
                        setMessage("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "red",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
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
      {
        // Add User Modal
      }
      <Modal
        open={openUser}
        onClose={handleCloseUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openUser} timeout={500}>
          <Box sx={modalStyleMobile}>
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
                  Create New User
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
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
                    placeholder="Enter username"
                    className="searchInput"
                    value={username}
                    onChange={(e) => {
                      if (e.target.value.length >= 32) {
                        setUsername(e.target.value.substring(0, 32));
                      }
                      if (e.target.value.length < 32) {
                        setUsername(e.target.value);
                      }
                    }}
                  />
                  <div>{`${32 - username.length}`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addUser();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <AddCircleIcon
                      style={{
                        color: "#30ceb7",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
                        color: "white",
                      }}
                    >
                      Create User
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleCloseUser();
                      setTimeout(() => {
                        setUsername("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "red",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.8rem",
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
      {
        // Header Bar
      }
      <div
        style={{
          height: "12vh",
          width: "100vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: "2px",
          borderBottomStyle: "solid",
          borderBottomColor: "rgba(255,255, 255, 0.5)",
        }}
      >
        <div style={{ margin: "1rem" }}>
          <Link href="/">
            <Image src="/logoW.png" alt="logo" width={70} height={70} />
          </Link>
        </div>
        <div style={{ margin: "1rem" }}>
          <WalletMultiButton />
        </div>
      </div>
      {
        // Body
      }
      <div
        style={{
          height: "8vh",
          width: "100vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid white",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
        }}
      >
        <button
          style={{
            width: "50vw",
            height: "100%",
            background: !sortBy ? "white" : "black",
            border: "none",
          }}
          onClick={() => {
            setSortBy(false);
            sortByBalance();
          }}
        >
          <div style={{ color: !sortBy ? "black" : "white" }}>
            Sort By Boost
          </div>
        </button>
        <button
          style={{
            width: "50vw",
            height: "100%",
            background: sortBy ? "white" : "black",
            border: "none",
          }}
          onClick={() => {
            setSortBy(true);
            sortByDate();
          }}
        >
          <div style={{ color: sortBy ? "black" : "white" }}>Sort By Data</div>
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
          width: "100vw",
        }}
      >
        <div className="scrollable-div-mobile">
          {posts.map((post, index) => {
            return (
              <div
                key={index}
                style={{
                  padding: "5px",
                  width: "100%",
                  borderWidth: "0px 0px 1px 0px",
                  borderStyle: "solid",
                  borderColor: "rgba(255,255, 255, 0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link
                    href={`../profile/${post.owner}`}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    <Image
                      style={{ borderRadius: "50%", margin: "10px" }}
                      src={`/pfp/${ownerToIndexMap[post.owner]}.png`} // Use the mapped index for the pfp source
                      alt="logo"
                      width={40}
                      height={40}
                    />
                    <>
                      {findUser(users, post.owner) === post.owner ? (
                        <div style={{ color: "white", fontSize: "0.9rem" }}>
                          {post.owner.substring(0, 4)}...
                          {post.owner.substring(post.owner.length - 4)}
                        </div>
                      ) : (
                        <div style={{ color: "white", fontSize: "0.9rem" }}>
                          {findUser(users, post.owner).length > 10
                            ? findUser(users, post.owner).substring(0, 10) +
                              "..."
                            : findUser(users, post.owner)}
                        </div>
                      )}
                    </>
                  </Link>
                  <div style={{ color: "white", margin: "10px" }}>
                    {` ${getTimeDifference(post.timestamp * 1000, Date.now())}`}
                  </div>
                  <div style={{ color: "white", margin: "10px" }}>
                    {`Boost : ${
                      Math.round(
                        (post.balance / LAMPORTS_PER_SOL - 0.002) * 1000
                      ) / 1000
                    } SOL`}
                  </div>
                </div>
                <div
                  style={{
                    color: "white",
                    margin: "10px 20px 50px 30px",
                    fontSize: "1.3rem",
                    textAlign: "justify",
                  }}
                >
                  {post.content}
                </div>
                <div
                  style={{
                    color: "white",
                    marginBottom: "10px",
                    fontSize: "1.3rem",
                    flexDirection: "row",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedPost(post.addressPDA);
                      handleOpenBoost();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <BoltIcon
                      style={{
                        color: "#30ceb7",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.7rem",
                        color: "white",
                      }}
                    >
                      Boost Post
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/address/${post.addressPDA}?cluster=devnet`,
                        "_blank"
                      )
                    }
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <ExploreIcon
                      style={{
                        color: "#30ceb7",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <div
                      style={{
                        margin: "5px",
                        fontSize: "0.7rem",
                        color: "white",
                      }}
                    >
                      Explorer
                    </div>
                  </button>
                  {post.owner === pubkey?.toBase58() && (
                    <button
                      disabled={post.owner !== pubkey?.toBase58()}
                      onClick={() => {
                        withdrawPost(post.addressPDA);
                      }}
                      className={orbitron.className + " buttonInteraction"}
                    >
                      <AccountBalanceWalletIcon
                        style={{
                          color: "#30ceb7",
                          width: "1.5rem",
                          height: "1.5rem",
                        }}
                      />
                      <div
                        style={{
                          margin: "5px",
                          fontSize: "0.7rem",
                          color: "white",
                        }}
                      >
                        Withdraw
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {
        // Footer
      }
      <div
        style={{
          height: "10vh",
          width: "100vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "rgba(255,255, 255, 0.5)",
        }}
      >
        {findUser(users, publicKey?.toBase58()) === publicKey?.toBase58() ? (
          <button
            onClick={() => handleOpenUser()}
            className={orbitron.className + " buttonInteraction"}
          >
            <AddCircleIcon
              style={{
                color: "#30ceb7",
                width: "1.5rem",
                height: "1.5rem",
              }}
            />
            <div
              style={{
                margin: "5px",
                fontSize: "1rem",
                color: "white",
              }}
            >
              Create User
            </div>
          </button>
        ) : (
          <Link
            href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "1.2rem",
              color: "white",
              margin: "1rem",
            }}
          >
            {`${findUser(users, publicKey?.toBase58())}`}
          </Link>
        )}
        <div style={{ margin: "1rem" }}></div>
        <div style={{ margin: "1rem" }}>
          <button
            onClick={() => handleOpenPost()}
            className={orbitron.className + " buttonInteraction"}
          >
            <AddCircleIcon
              style={{
                color: "#30ceb7",
                width: "1.5rem",
                height: "1.5rem",
              }}
            />
            <div
              style={{
                margin: "5px",
                fontSize: "1rem",
                color: "white",
              }}
            >
              Add Post
            </div>
          </button>
        </div>
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment>
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
      {
        // Post Modal
      }
      <Modal
        open={openPost}
        onClose={handleClosePost}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openPost} timeout={500}>
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
                  Create New Post
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
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
                    placeholder="Enter post message"
                    className="searchInput"
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length >= 128) {
                        setMessage(e.target.value.substring(0, 128));
                      }
                      if (e.target.value.length < 128) {
                        setMessage(e.target.value);
                      }
                    }}
                  />
                  <div>{`${128 - message.length} / 128`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addPost();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <AddCircleIcon
                      style={{
                        color: "#30ceb7",
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
                      Add Post
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleClosePost();
                      setTimeout(() => {
                        setMessage("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "red",
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
      {
        // Add User Modal
      }
      <Modal
        open={openUser}
        onClose={handleCloseUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openUser} timeout={500}>
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
                  Create New User
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
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
                    placeholder="Enter username"
                    className="searchInput"
                    value={username}
                    onChange={(e) => {
                      if (e.target.value.length >= 32) {
                        setUsername(e.target.value.substring(0, 32));
                      }
                      if (e.target.value.length < 32) {
                        setUsername(e.target.value);
                      }
                    }}
                  />
                  <div>{`${32 - username.length} / 32`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addUser();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <AddCircleIcon
                      style={{
                        color: "#30ceb7",
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
                      Create User
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleCloseUser();
                      setTimeout(() => {
                        setUsername("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "red",
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
      {
        // Header Bar
      }
      <div
        style={{
          height: "10vh",
          width: "99vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "rgba(255,255, 255, 0.5)",
        }}
      >
        <div style={{ margin: "1rem" }}>
          <Link href="/">
            <Image src="/logoW.png" alt="logo" width={70} height={70} />
          </Link>
        </div>
        <div className="searchBar">
          <Search className="searchIcon" color="white" />
          <input
            placeholder="Search for posts"
            className="searchInput"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
        </div>
        <div style={{ margin: "1rem" }}>
          <button
            onClick={() => handleOpenPost()}
            className={orbitron.className + " buttonInteraction"}
          >
            <AddCircleIcon
              style={{
                color: "#30ceb7",
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
              Add Post
            </div>
          </button>
        </div>
        <div style={{ margin: "1rem" }}>
          <WalletMultiButton />
        </div>
      </div>
      {
        // Body
      }
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: "90vh",
          width: "99vw",
        }}
      >
        <div
          style={{
            backgroundColor: "black",
            width: "20%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRightWidth: "1px",
            borderRightStyle: "solid",
            borderRightColor: "rgba(255,255, 255, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            style={{ borderRadius: "50%", margin: "1rem" }}
            src={`/pfp/${ownerToIndexMap[publicKey?.toBase58()]}.png`} // Use the mapped index for the pfp source
            alt="logo"
            width={150}
            height={150}
          />
          <div style={{ fontSize: "1.2rem", color: "white" }}>
            Logged in as:
          </div>
          <Link
            href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "1.2rem",
              color: "white",
              marginTop: "0rem",
            }}
          >
            {findUser(users, publicKey?.toBase58()) ===
            publicKey?.toBase58() ? (
              <Fragment>
                {publicKey?.toBase58().substring(0, 22)}
                <br />
                {publicKey?.toBase58().substring(22)}
              </Fragment>
            ) : (
              `${findUser(users, publicKey?.toBase58())}`
            )}
          </Link>
          <div
            style={{
              marginTop: "2rem",
              fontSize: "1.2rem",
              color: "white",
            }}
          >
            {`SOL Balance : ${
              Math.round((balance / LAMPORTS_PER_SOL) * 1000) / 1000
            }`}
          </div>
          {findUser(users, publicKey?.toBase58()) === publicKey?.toBase58() ? (
            <div
              style={{
                marginTop: "2rem",
                fontSize: "1.2rem",
                color: "white",
              }}
            >
              <button
                disabled={false}
                onClick={() => handleOpenUser()}
                className={orbitron.className + " buttonInteraction"}
              >
                <AddCircleIcon
                  style={{
                    color: "#30ceb7",
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
                  Create User{" "}
                </div>
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: "2rem",
                fontSize: "1.2rem",
                color: "white",
              }}
            >
              {`Followers : ${findFollowers(users, publicKey?.toBase58())}`}
            </div>
          )}
        </div>
        <div className="scrollable-div">
          {posts.map((post, index) => {
            return (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  width: "100%",
                  borderWidth: "0px 0px 1px 0px",
                  borderStyle: "solid",
                  borderColor: "rgba(255,255, 255, 0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Link
                    href={`../profile/${post.owner}`}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    <Image
                      style={{ borderRadius: "50%", margin: "1rem" }}
                      src={`/pfp/${ownerToIndexMap[post.owner]}.png`} // Use the mapped index for the pfp source
                      alt="logo"
                      width={50}
                      height={50}
                    />
                    <div style={{ color: "white", fontSize: "1.2rem" }}>
                      {findUser(users, post.owner) === post.owner ? (
                        <>{post.owner}</>
                      ) : (
                        <>{findUser(users, post.owner)}</>
                      )}
                    </div>
                  </Link>
                  <div style={{ color: "white", marginLeft: "1rem" }}>
                    {` ${getTimeDifference(post.timestamp * 1000, Date.now())}`}
                  </div>
                  <div style={{ color: "white", marginLeft: "1rem" }}>
                    {`Boost : ${
                      Math.round(
                        (post.balance / LAMPORTS_PER_SOL - 0.002) * 1000
                      ) / 1000
                    } SOL`}
                  </div>
                </div>
                <div
                  style={{
                    color: "white",
                    marginRight: "50px",
                    marginLeft: "50px",
                    marginBottom: "50px",
                    fontSize: "1.3rem",
                    textAlign: "justify",
                  }}
                >
                  {post.content}
                </div>
                <div
                  style={{
                    color: "white",
                    marginRight: "50px",
                    marginLeft: "50px",
                    marginBottom: "10px",
                    fontSize: "1.3rem",
                    flexDirection: "row",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedPost(post.addressPDA);
                      handleOpenBoost();
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <BoltIcon
                      style={{
                        color: "#30ceb7",
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
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/address/${post.addressPDA}?cluster=devnet`,
                        "_blank"
                      )
                    }
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <ExploreIcon
                      style={{
                        color: "#30ceb7",
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
                      Explorer
                    </div>
                  </button>
                  {post.owner === pubkey?.toBase58() && (
                    <button
                      disabled={post.owner !== pubkey?.toBase58()}
                      onClick={() => {
                        withdrawPost(post.addressPDA);
                      }}
                      className={orbitron.className + " buttonInteraction"}
                    >
                      <AccountBalanceWalletIcon
                        style={{
                          color: "#30ceb7",
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
                        Withdraw
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            backgroundColor: "black",
            width: "20%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderLeftWidth: "1px",
            borderLeftStyle: "solid",
            borderLeftColor: "rgba(255,255, 255, 0.5)",
            color: "white",
          }}
        >
          <div>
            <ListItemButton onClick={sortHandle}>
              <ListItemIcon>
                <SortIcon htmlColor="#30ceb7" />
              </ListItemIcon>
              <ListItemText primary="Sort By" />
              {!openSort ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSort} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton onClick={() => sortByDate()} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <DateRangeIcon htmlColor="#30ceb7" />
                  </ListItemIcon>
                  <ListItemText primary="By Date" />
                </ListItemButton>
                <ListItemButton onClick={() => sortByBalance()} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <AccountBalanceWalletIcon htmlColor="#30ceb7" />
                  </ListItemIcon>
                  <ListItemText primary="By Boost" />
                </ListItemButton>
              </List>
            </Collapse>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
