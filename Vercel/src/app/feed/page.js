"use client";

import { Bolt, Search } from "@mui/icons-material";
import {
  completeStringWithSymbol,
  generateRandomString,
  getTimeDifference,
  modalStyle,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
// React Toastify
import { toast } from "react-toastify";

import BoltIcon from "@mui/icons-material/Bolt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ExploreIcon from "@mui/icons-material/Explore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Modal from "@mui/material/Modal";
import { Box, Fade, Typography } from "@mui/material";

const postSchema = {
  struct: { content: "string", owner: "string", timestamp: "u32" },
};

const withdrawSchema = {
  struct: { instruction: "u8" },
};

const addPostSchema = {
  struct: {
    instruction: "u8",
    bump: "u8",
    seed: "string",
    space: "u8",
    content: "string",
    owner: "string",
    timestamp: "u32",
  },
};

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

export default function Address() {
  // Detect if device has a touch screen, then a mobile device, its not perfect, but it simplifies the code
  const isTouchScreen = "ontouchstart" in window || navigator.msMaxTouchPoints;
  // We use the wallet hooks to interact with the blockchain
  const { publicKey, sendTransaction } = useWallet();
  const [pubkey, setPubkey] = useState(null);
  const { connection } = useConnection();
  // States and refs for the UI
  const [selector, setSelector] = useState(0);
  const [balance, setBalance] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");

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
          dataSize: 184, // number of bytes
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
      };
    });
    setPosts(posts);
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
        owner: publicKey.toBase58(),
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
        getBalance();
      }, 2000);
    } catch (e) {
      console.log(e);
    }
  }, [publicKey, connection, sendTransaction, message, getPosts, getBalance]);

  // Detect when wallet is connected and get balance
  useEffect(() => {
    if (publicKey) {
      setPubkey(publicKey);
      getBalance();
      getPosts();
    }
  }, [publicKey, getBalance, getPosts]);

  return (
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
                    className="buttonInteraction"
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
                        fontSize: "1rem",
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
                    className="buttonInteraction"
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
                        fontSize: "1rem",
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
                  Create new post
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
                    className="buttonInteraction"
                  >
                    <AddCircleIcon
                      style={{
                        color: "white",
                        width: "2rem",
                        height: "2rem",
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
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleClosePost();
                      setTimeout(() => {
                        setMessage("");
                        setLoading(false);
                      }, 500);
                    }}
                    className="buttonInteraction"
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
                        fontSize: "1rem",
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
            className="buttonInteraction"
          >
            <AddCircleIcon
              style={{
                color: "white",
                width: "2rem",
                height: "2rem",
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
          <div style={{ fontSize: "1.5rem", color: "white" }}>Address</div>
          <Link
            href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "1.5rem",
              color: "white",
              marginTop: "2rem",
            }}
          >
            {
              // If the device has a touch screen, only show the first 22 characters of the address
              // Otherwise, show the full address
            }
            {publicKey?.toBase58().substring(0, 22)}
            <br />
            {publicKey?.toBase58().substring(22)}
          </Link>
          <div
            style={{
              marginTop: "2rem",
              fontSize: "1.5rem",
              color: "white",
            }}
          >
            {
              // Lamports is a unit of SOL, 1 SOL is 1,000,000,000 (10^9) lamports, when you call getBalance, you get the balance in lamports, to show the balance in SOL, we divide by 10^9 or LAMPORTS_PER_SOL
            }
            {`SOL Balance : ${balance / LAMPORTS_PER_SOL}`}
          </div>
          <div
            style={{
              marginTop: "2rem",
              fontSize: "1.5rem",
              color: "white",
            }}
          >
            <button
              disabled={loading}
              onClick={() => {
                setLoading(true);
                addPost();
              }}
              className="buttonInteraction"
            >
              <AddCircleIcon
                style={{
                  color: "white",
                  width: "2rem",
                  height: "2rem",
                }}
              />
              <div
                style={{
                  margin: "5px",
                  fontSize: "1rem",
                  color: "white",
                }}
              >
                Create Profile
              </div>
            </button>
          </div>
        </div>
        <div className="scrollable-div">
          {posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((post, index) => {
              return (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    width: "100%",
                    borderWidth: "1px",
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
                      href={`https://explorer.solana.com/address/${post.owner}?cluster=devnet`}
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
                        src="/logoW.png"
                        alt="logo"
                        width={50}
                        height={50}
                      />
                      <div style={{ color: "white", fontSize: "1.3rem" }}>
                        {post.owner}
                      </div>
                    </Link>
                    <div style={{ color: "white", margin: "1rem" }}>
                      {` ${getTimeDifference(
                        post.timestamp * 1000,
                        Date.now()
                      )}`}
                    </div>
                    <div style={{ color: "white", margin: "1rem" }}>
                      {`| Balance : ${post.balance / LAMPORTS_PER_SOL} SOL`}
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
                      className="buttonInteraction"
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
                          fontSize: "1rem",
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
                      className="buttonInteraction"
                    >
                      <ExploreIcon
                        style={{
                          color: "white",
                          width: "2rem",
                          height: "2rem",
                        }}
                      />
                      <div
                        style={{
                          margin: "5px",
                          fontSize: "1rem",
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
                        className="buttonInteraction"
                      >
                        <AccountBalanceWalletIcon
                          style={{
                            color: "white",
                            width: "2rem",
                            height: "2rem",
                          }}
                        />
                        <div
                          style={{
                            margin: "5px",
                            fontSize: "1rem",
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
          }}
        ></div>
      </div>
    </React.Fragment>
  );
}
