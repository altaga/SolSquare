"use client";
import React, { useEffect } from "react";
import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { OwnerProvider } from "../../context/feedContext";
import { useOwner } from "../../context/feedContext";

const Layout = ({ children }) => {
  return <OwnerProvider>{children}</OwnerProvider>;
};

export default Layout;