"use client"
import UserProfile from "../../components/UserProfile";
import SortSideBar from "../../components/SortSideBar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { Fragment, useCallback, useEffect, useState } from "react";

const layout = ({ children }) => {

    const [ownerToIndexMap, setOwnerToIndexMap] = useState({});

  

  // We use the wallet hooks to interact with the blockchain
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();
  const [pubkey, setPubkey] = useState(null);
  const { connection } = useConnection();
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
      <UserProfile ownerToIndexMap={ownerToIndexMap}  />
      {children}
      <SortSideBar />
    </div>
  );
};

export default layout;
