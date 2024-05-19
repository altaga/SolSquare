"use client";
import React, { useEffect } from "react";

import React from "react";
import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { OwnerProvider } from "../../context/feedContext";
import { useOwner } from "../../context/feedContext";

const FeedLayOut = ({children}) => {
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();
  const {
    getBalance,

    getUsers,
    setRendered,
    rendered,
  } = useOwner();

  console.log("publicKey", publicKey);
  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    if (publicKey && rendered) {
      getBalance();
      // getPosts();
      getUsers();
    } else if (!publicKey && rendered) {
      //   router.push("/");
    }
  }, [
    publicKey,
    // setPubkey,
    getBalance,
    // getPosts,
    getUsers,
    rendered,
    // router,
    // loginFlag,
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
