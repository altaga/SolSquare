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
import { Box, Fade, Link, Typography, Slider } from "@mui/material";
import Modal from "@mui/material/Modal";
import Post from "../../../components/Post";
import { useParams, useLocation, useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";
import { withdrawSchema } from "../../../utils/schema";
import { useOwner } from "../../../context/feedContext";
import TransactionToast from "../../../components/TransactionToast";
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

  const handleSliderChange = (event, newValue) => {
    setAmount(Math.pow(10, newValue));
  };

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

  let [amount, setAmount] = useState(0);

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
          parseFloat(amount.toFixed(0)) * Math.pow(10, 5) // 5 decimals for Bonk
        )
      );
      const signature = await sendTransaction(transaction, connection);
      transactionToast(signature, "Post boosted with Bonk!");
      handleCloseBoost();
      setTimeout(() => {
        setAmount(0);
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
                <div className={orbitron.className} style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  Let's boost this post!
                </div>
                <Slider
                value={Math.log10(amount)}
                onChange={handleSliderChange}
                min={2}
                max={8}
                step={0.2}
                sx={{
                  color: "rgb(231, 140, 25)",
                  '& .MuiSlider-thumb': {
                    backgroundImage: `url('/bonk.webp')`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    width: 24,
                    height: 24,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: "rgb(231, 140, 25)",
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#d3d3d3',
                  },
                }}
              />
              <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                Amount: {amount.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </Typography>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly", marginTop:"1rem" }}
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
                        color: "rgb(231, 140, 25)",
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
                        setAmount(0);
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
