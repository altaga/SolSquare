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
import Post from "../../../components/Post";
import { useRouter, useParams } from "next/navigation";
import { Orbitron } from "next/font/google";

import {
  postSchema,
  addPostSchema,
  userSchema,
  addUserSchema,
  withdrawSchema,
} from "../../../utils/schema";

import { useOwner } from "../../../context/feedContext";
import TransactionToast from "../../../components/TransactionToast";
// Fonts
const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

export default function FeedHome() {
  const parentId = useParams();

  const { publicKey, sendTransaction } = useWallet();

  const {
    pubkey,
    getUsers,
    users,
    getBalance,
    getPosts,
    posts,
    setLoading,
    loading,
    ownerToIndexMap,
    setParentPost,
  } = useOwner();
  const { connection } = useConnection();

  if (parentId?.id) {
    setParentPost(parentId.id);
  } else {
    return;
  }
  let [amount, setAmount] = useState("");
  // Modal Boost
  const [openBoost, setOpenBoost] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState("");
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
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(selectedPost),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      TransactionToast(signature, "Post boosted");
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
        TransactionToast(signature, "Withdraw from post");
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
    </>
  );
}
