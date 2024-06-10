"use client";

import { modalStyle } from "../../../utils/utils";

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

import React, { useCallback, useEffect, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Box, Fade, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import Post from "../../../components/Post";
import { useParams, useLocation, useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";

import { withdrawSchema } from "../../../utils/schema";

import { useOwner } from "../../../context/feedContext";
import TransactionToast from "../../../components/TransactionToast";

const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

export default function FeedHome() {
  const parentId = useParams();
  const navigate = useRouter();
  const { publicKey, sendTransaction } = useWallet();

  const {
    pubkey,

    users,
    getBalance,
    getPosts,
    posts,
    setLoading,
    loading,
    ownerToIndexMap,
    setParentPost,
    parentPostData,
    getMainPDAInfo,
    countReplies
  } = useOwner();
  const { connection } = useConnection();

  useEffect(() => {
    if (parentId?.id) {
      //set The parentPost Data

      getMainPDAInfo(parentId.id);
      setParentPost(parentId.id);
    
    } else {
      return;
    }

    return () => {
      setParentPost(null);
    };
  }, [parentId]);

  const [amount, setAmount] = useState("");
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
    setLoading,
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
        {parentPostData && (
            <div
              style={{
                width: "100%",
                marginLeft: "2rem",
              }}>
            <button
              className={orbitron.className + " buttonInteraction"}
              onClick={() => {
                navigate.back();
              }}
              style={{
                display: "flex flex-start",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
            <ArrowBackIcon
              style={{
                color: "#E78C19",
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
              Back
            </div>
            </button>
            <Post
              post={parentPostData}
              pubkey={pubkey}
              ownerToIndexMap={ownerToIndexMap}
              visiblePosts={visiblePosts}
              toggleVisibility={toggleVisibility}
              setSelectedPost={setSelectedPost}
              handleOpenBoost={handleOpenBoost}
              withdrawPost={withdrawPost}
              users={users}
              index={0}
              countReplies={countReplies}
            />
            </div>
        )}
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
                index={index + 1}
                countReplies={countReplies}
              />
            );
          })}
      </div>
    </>
  );
}
