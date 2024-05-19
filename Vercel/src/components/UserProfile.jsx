"use client";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import { findUser } from "../utils/utils";
import { Orbitron } from "next/font/google";
import AddCircleIcon from "@mui/icons-material/AddCircle";


const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });



const UserProfile = ({ ownerToIndexMap, publicKey, users,balance}) => {
  return (
    <div
      style={{
        backgroundColor: "black",
        width: "20%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        borderRightColor: "rgba(255,255, 255, 0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        style={{ borderRadius: "50%", margin: "1rem" }}
        src={`/pfp/${ownerToIndexMap[publicKey?.toBase58()]}.png`} // Use the mapped index for the pfp source
        alt="logo"
        width={150}
        height={150}
      />
      <div style={{ fontSize: "1.2rem", color: "white" }}>Logged in as:</div>
      <Link
        href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: "1.2rem",
          color: "white",
          marginTop: "0rem",
        }}
      >
        {findUser(users, publicKey?.toBase58()) === publicKey?.toBase58() ? (
          <Fragment>
            {publicKey?.toBase58().substring(0, 22)}
            <br />
            {publicKey?.toBase58().substring(22)}
          </Fragment>
        ) : (
          `${findUser(users, publicKey?.toBase58())}`
        )}
      </Link>
      <div
        style={{
          marginTop: "2rem",
          fontSize: "1.2rem",
          color: "white",
        }}
      >
        {`SOL Balance : ${
          Math.round((balance / LAMPORTS_PER_SOL) * 1000) / 1000
        }`}
      </div>
      {findUser(users, publicKey?.toBase58()) === publicKey?.toBase58() ? (
        <div
          style={{
            marginTop: "2rem",
            fontSize: "1.2rem",
            color: "white",
          }}
        >
          <button
            disabled={false}
            onClick={() => handleOpenUser()}
            className={orbitron.className + " buttonInteraction"}
          >
            <AddCircleIcon
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
              Create User{" "}
            </div>
          </button>
        </div>
      ) : (
        <div
          style={{
            marginTop: "2rem",
            fontSize: "1.2rem",
            color: "white",
          }}
        ></div> //{`Followers : ${findFollowers(users, publicKey?.toBase58())}`}
      )}
    </div>
  );
};

export default UserProfile;
