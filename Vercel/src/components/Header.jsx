"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Orbitron } from "next/font/google";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Modal from "@mui/material/Modal";
import { modalStyle } from "../utils/utils";
import CancelIcon from "@mui/icons-material/Cancel";

const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });
import { Box, Fade, Typography } from "@mui/material";
import { useOwner } from "../context/feedContext";
const Header = () => {
  const { publicKey } = useWallet();

  const {
    addPost,
    setMessage,
    message,
    loading,
    setLoading,
    openPost,
    handleClosePost,
    handleOpenPost,
    setSinglePostPage,
  } = useOwner();

  if (!publicKey) {
    return;
  }
  return (
    <>
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
            // value={searchValue}
            onChange={(e) => {
              //   setSearchValue(e.target.value);
            }}
          />
        </div>
        {publicKey && (
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
        )}
        <div style={{ margin: "1rem" }}>
          <WalletMultiButton />
        </div>
      </div>
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
                      if (e.target.value.length >= 256) {
                        setMessage(e.target.value.substring(0, 256));
                      }
                      if (e.target.value.length < 256) {
                        setMessage(e.target.value);
                      }
                    }}
                  />
                  <div>{`${256 - message.length} / 256`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addPost(message);
                      setSinglePostPage(false);
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
    </>
  );
};

export default Header;
