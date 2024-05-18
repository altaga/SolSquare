"use client";
import React from "react";
import { Orbitron } from "next/font/google";
import { useRouter } from "next/navigation";
import { findUser, getTimeDifference } from "../utils/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Image from "next/image";
import Link from "next/link";
import BoltIcon from "@mui/icons-material/Bolt";
import ExploreIcon from "@mui/icons-material/Explore";

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
}) => {
  const router = useRouter();

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
      onClick={() => {
        router.push(`/feed/${post.addressPDA}`);
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
            Math.round((post.balance / LAMPORTS_PER_SOL - 0.002) * 1000) / 1000
          } SOL`}
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
            }}
          >
            Show Post
          </button>
        </>
      ) : (
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
      )}

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
};

export default Post;
