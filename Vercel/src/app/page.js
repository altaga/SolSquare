"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useEffect } from "react";
import { getFilesServer } from "../actions/ipfs";
import { predictRudeness } from "../actions/rudeness";

export default function Home() {
  // Detect if wallet is connected
  const { publicKey } = useWallet();

  useEffect(() => {
    async function run() {
    }
    run();
  }, []);

  useEffect(() => {
    // If wallet is connected, redirect to address
    if (publicKey) {
      window.location.href = `/feed`;
    }
  }, [publicKey]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 0 10px rgba(255,255, 255, 1)",
        }}
      >
        <Image
          src="/logoB.png"
          alt="logo"
          width={200}
          height={200}
          style={{ marginBottom: "1rem" }}
        />
        <h2
          style={{
            color: "black",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          <div>{"Connect your wallet"}</div>
        </h2>
        {
          // Wallet Multi Button, this component create an interface for the user to connect their wallet
        }
        <WalletMultiButton />
      </div>
    </div>
  );
}
