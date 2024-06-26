"use client";
import React, { useEffect } from "react";
import UserProfile from "../../components/UserProfile";
import Journey from "../../components/Journey";
import {  useWallet } from "@solana/wallet-adapter-react";

import { useOwner } from "../../context/feedContext";
import { usePathname } from "next/navigation";

const FeedLayOut = ({ children }) => {
  const { publicKey } = useWallet();
  const pathname = usePathname();

  const {
    getBalance,
    setPubkey,
    getUsers,
    setRendered,
    rendered,
   
    getPosts,
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
  }, [publicKey, getBalance, getPosts, getUsers, rendered]);


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
      <Journey />
      
    </div>
  );
};

export default FeedLayOut;
