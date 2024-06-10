"use client";

import { modalStyle } from "../../utils/utils";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";
import React, { useCallback, useState, useEffect, use } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import CancelIcon from "@mui/icons-material/Cancel";
import { Box, Fade, Link, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import Post from "../../components/Post";
import { usePathname } from "next/navigation";
import { Orbitron } from "next/font/google";

import { withdrawSchema } from "../../utils/schema";

import { useOwner } from "../../context/feedContext";
import TransactionToast from "../../components/TransactionToast";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { toast } from "react-toastify";

const tokenAddress = new PublicKey(process.env.NEXT_PUBLIC_TOKEN_ADDRESS);
const tokenAddressAuthority = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS_AUTH
);

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

const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

export default function FeedHome() {
  const { publicKey, sendTransaction } = useWallet();
  const pathname = usePathname();

  const {
    pubkey,
    users,
    getBalance,
    getPosts,
    posts,
    setLoading,
    loading,
    ownerToIndexMap,
    setOwnerToIndexMap,
    setParentPostData,
    selectedPost,
    setSelectedPost
  } = useOwner();
  const { connection } = useConnection();

  let [amount, setAmount] = useState("");

  const [openBoost, setOpenBoost] = React.useState(false);
  const handleOpenBoost = () => setOpenBoost(true);
  const handleCloseBoost = () => setOpenBoost(false);

  const [visiblePosts, setVisiblePosts] = useState({});

  const toggleVisibility = (postIndex) => {
    setVisiblePosts((prev) => ({
      ...prev,
      [postIndex]: !prev[postIndex],
    }));
  };

  const boostPost = useCallback(async () => {
    try {
      const [addressFrom] = PublicKey.findProgramAddressSync(
        [
          publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenAddress.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const [addressTo] = PublicKey.findProgramAddressSync(
        [
          new PublicKey(selectedPost).toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenAddress.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      let isTokenAccountAlreadyMade = false;
      try {
        await getAccount(connection, addressTo, "confirmed", TOKEN_PROGRAM_ID);
        isTokenAccountAlreadyMade = true;
      } catch {
        // Nothing
      }
      let transaction = new Transaction();
      if (!isTokenAccountAlreadyMade) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            addressTo,
            new PublicKey(selectedPost),
            tokenAddress,
            TOKEN_PROGRAM_ID
          )
        );
      }
      transaction.add(
        createTransferInstruction(
          addressFrom,
          addressTo,
          publicKey,
          parseFloat(amount) * Math.pow(10, 5) // 5 decimals for Bonk
        )
      );
      const signature = await sendTransaction(transaction, connection);
      transactionToast(signature, "Post boosted with Bonk!");
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
        const [addressTo] = PublicKey.findProgramAddressSync(
          [
            publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenAddress.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const [addressFrom] = PublicKey.findProgramAddressSync(
          [
            new PublicKey(PDA).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenAddress.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const data = Buffer.from(serialize(withdrawSchema, { instruction: 5 }));
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
                pubkey: addressFrom,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: tokenAddress,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: addressTo,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: tokenAddressAuthority,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: TOKEN_PROGRAM_ID,
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

  useEffect(() => {
    if (pubkey) {
      setParentPostData(null);
      getBalance();
      getPosts();
    }
  }, [pathname]);

  return (
    <>
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
                      Boost
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
                key={"post-" + index}
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
    </>
  );
}
