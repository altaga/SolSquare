"use client";
import React, { useEffect } from "react";

import React from "react";
import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useOwner } from "../../context/feedContext";
import { useRouter } from "next/navigation";

const FeedLayOut = ({ children }) => {
  const router = useRouter();
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();

  const {
    getBalance,
    setPubkey,
    getUsers,
    setRendered,
    rendered,
    posts,
    setOwnerToIndexMap,
    getPosts
  } = useOwner();

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    if (publicKey && rendered) {
      setPubkey(publicKey);
      getBalance();
      getPosts();
      getUsers();
    }
  }, [
    publicKey,
    getBalance,
    getPosts,
    getUsers,
    rendered,
    router
  ]);

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
      <UserProfile />
      {children}
      <SortSideBar />
    </div>
  );
};

export default FeedLayOut;
