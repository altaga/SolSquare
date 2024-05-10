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
      const result = await getFilesServer();
      console.log(result);
      let rudeness = await predictRudeness("Hello Have a nice day"); // Control
      console.log(
        rudeness.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessId = await predictRudeness("You Nigga!"); // Identity Attack
      console.log(
        rudenessId.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessIn = await predictRudeness("Fucking shit!"); // Insult
      console.log(
        rudenessIn.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessOb = await predictRudeness("Nice tits and ass"); // Obscene
      console.log(
        rudenessOb.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessTo = await predictRudeness("Hope you die soon"); // Toxic
      console.log(
        rudenessTo.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessSe = await predictRudeness("I want fuck you"); // Sexual
      console.log(
        rudenessSe.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessTr = await predictRudeness("Im gonna kill you"); // Threat
      console.log(
        rudenessTr.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
      let rudenessTox = await predictRudeness(
        "Your mom is a dumb and sick piece of shit"
      ); // Severe Toxic
      console.log(
        rudenessTox.map((item) => {
          return {
            detection: item.results[0].match ?? true,
            label: item.label,
          };
        })
      );
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
