"use client";
import React from "react";
import { Orbitron } from "next/font/google";
import { useRouter } from "next/navigation";
import { findUser, getTimeDifference } from "../utils/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CommentIcon from "@mui/icons-material/Comment";
import Image from "next/image";
import Link from "next/link";
import BoltIcon from "@mui/icons-material/Bolt";
import ExploreIcon from "@mui/icons-material/Explore";
import { useOwner } from "../context/feedContext";
import { Select } from "@mui/material";
// Fonts
const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });
const Post = ({
  pubkey,
  ownerToIndexMap,
  visiblePosts,
  toggleVisibility,
  setSelectedPost,
  handleOpenBoost,
  withdrawPost,
  post,
  users,
  index,
  countReplies
}) => {
  const router = useRouter();
  const { setParentPostData, parentId, setOpenPost, setSinglePostPage } =
    useOwner();
  return (
    <div
      key={index}
      className="post"
    >
      <div
        onClick={() => {
          if (
            (post.rudeness && visiblePosts[post.addressPDA]) ||
            !post.rudeness
          ) {
            router.push(`/feed/${post.addressPDA}`);
          }
        }}
        style={{
          cursor: "pointer",
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
            {ownerToIndexMap[post.owner] && (
              <Image
                style={{ borderRadius: "15%", margin: "1rem" }}
                src={`/pfp/${ownerToIndexMap[post.owner]}.png`} // Use the mapped index for the pfp source
                alt="logo"
                width={50}
                height={50}
              />
            )}
            <div style={{ color: "white", fontSize: "1.2rem" }}>
              {findUser(users, post.owner) === post.owner ? (
                <>{post.owner.slice(0,5)+'...'+post.owner.slice(-5)  }</>
              ) : (
                <>{findUser(users, post.owner)}</>
              )}
            </div>
          </Link>
          <div style={{ color: "white", marginLeft: "1rem" }}>
            {` ${getTimeDifference(post.timestamp * 1000, Date.now())}`}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              marginRight: "0.5rem"
            }}
          >
            <div
              style={{
                color: "white",
                marginRight: "0.5rem"
              }}
            >
              {`⚡${Math.round(post.bonkBalance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} BONK`}
            </div>
            <Image src={"/bonk.webp"} alt="logo" width={25} height={25}></Image>
          </div>
        </div>
        {post.rudeness && !visiblePosts[post.addressPDA] ? (
          <>
            <button
              onClick={() => toggleVisibility(post.addressPDA)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "1.3rem",
                textDecoration: "underline",
                marginLeft: "3rem",
                marginBottom: "1.5rem",
              }}
            >
              Show Post
            </button>
          </>
        ) : (
          <div
            style={{
              color: "white",
              marginRight: "3rem",
              marginLeft: "3rem",
              marginBottom: "1.5rem",
              fontSize: "1.3rem",
              textAlign: "justify",
            }}
          >
            {post.content}
          </div>
        )}
      </div>
      <div
        style={{
          color: "white",
          marginRight: "1rem",
          marginLeft: "1rem",
          marginBottom: "1rem",
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
            Boost
          </div>
        </button>
        <button
          onClick={() => {
            setSelectedPost(post.addressPDA);
            setOpenPost(true);
            setSinglePostPage(true);
          }}
          className={orbitron.className + " buttonInteraction"}
        >
          <CommentIcon
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
            
            {`Reply (${countReplies(post.addressPDA)})`}
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
              Withdraw
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Post;
