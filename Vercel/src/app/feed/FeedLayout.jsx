"use client";
import React, { useEffect } from "react";

import React from "react";
import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { useOwner } from "../../context/feedContext";
import { useRouter } from "next/navigation";

const FeedLayOut = ({ children }) => {
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();

  const { getBalance, setPubkey, getUsers, setRendered, rendered } = useOwner();

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    if (publicKey && rendered) {
      setPubkey(publicKey);
      getBalance();
      // getPosts();
      getUsers();
    }
  }, [
    publicKey,
    getBalance,
    // getPosts,
    getUsers,
    rendered,
  ]);
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
