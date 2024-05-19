// pages/feed/layout.js
"use client";

import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";
import { OwnerProvider } from "../../context/feedContext";
import { useOwner } from "../../context/feedContext";
import FeedLayout from "./FeedLayout";
const Layout = ({ children }) => {


  return (
    <OwnerProvider>
     <FeedLayout/>
    </OwnerProvider>
  );
};

export default Layout;
