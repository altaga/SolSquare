"use client";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Image from "next/image";
import { findUser } from "../utils/utils";
import { Orbitron } from "next/font/google";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Modal } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { userSchema,addUserSchema } from "../utils/schema";
import {
  Box,
  Collapse,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  completeStringWithSymbol,
  generateRandomString,
  getTimeDifference,
  modalStyle,
  modalStyleMobile,
} from "../utils/utils";
import { useOwner } from "../context/feedContext";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { deserialize, serialize } from "borsh";
import TransactionToast from "../components/TransactionToast";

const orbitron = Orbitron({ weight: "400", subsets: ["latin"] });
const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

const UserProfile = () => {
  const {
    ownerToIndexMap,
    users,
    balance,
    loading,
    setUsers,
    setLoading,

    getUsers,
  } = useOwner();

  const [openUser, setOpenUser] = React.useState(false);
  const handleOpenUser = () => setOpenUser(true);
  const handleCloseUser = () => setOpenUser(false);
  const [username, setUsername] = useState("");
  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();
    const { connection } = useConnection();

  const addUser = useCallback(async () => {
    try {
      const seed = generateRandomString(32);

      let [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed), publicKey.toBuffer()],
        programId
      );

      const instruction = 3;

      const seedStruct = {
        owner: publicKey.toBytes(),
        username: completeStringWithSymbol(username, "~", 32),
        timestamp: Math.floor(Date.now() / 1000),
        followers: 0,
      };

      const space = serialize(userSchema, seedStruct).length;

      const transactionData = {
        instruction,
        bump,
        seed,
        space,
        ...seedStruct,
      };

      const encoded = serialize(addUserSchema, transactionData);

      const data = Buffer.from(encoded);
      let transaction = new Transaction().add(
        new TransactionInstruction({
          keys: [
            {
              pubkey: publicKey,
              isSigner: true,
              isWritable: true,
            },
            {
              pubkey: pda,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: SYSVAR_RENT_PUBKEY,
              isSigner: false,
              isWritable: false,
            },
            {
              pubkey: SystemProgram.programId,
              isSigner: false,
              isWritable: false,
            },
          ],
          data,
          programId,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      TransactionToast(signature, "User Created");
      handleCloseUser();
      setTimeout(() => {
        setUsername("");
        setLoading(false);
        getUsers();
      }, 2000);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }, [publicKey, connection, sendTransaction, username, getUsers]);

  return (
    <>
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
      <Modal
        open={openUser}
        onClose={handleCloseUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={openUser} timeout={500}>
          <Box sx={modalStyle}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div style={{ textAlign: "center", fontSize: "1.5rem" }}>
                  Create New User
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <input
                    style={{
                      alignSelf: "center",
                      marginTop: "1rem",
                      marginBottom: "1rem",
                      padding: "0.5rem",
                      borderRadius: "10px",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "black",
                    }}
                    placeholder="Enter username"
                    className="searchInput"
                    value={username}
                    onChange={(e) => {
                      if (e.target.value.length >= 32) {
                        setUsername(e.target.value.substring(0, 32));
                      }
                      if (e.target.value.length < 32) {
                        setUsername(e.target.value);
                      }
                    }}
                  />
                  <div>{`${32 - username.length} / 32`}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-evenly" }}
                >
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      addUser();
                    }}
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
                      Create User
                    </div>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => {
                      handleCloseUser();
                      setTimeout(() => {
                        setUsername("");
                        setLoading(false);
                      }, 500);
                    }}
                    className={orbitron.className + " buttonInteraction"}
                  >
                    <CancelIcon
                      style={{
                        color: "red",
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
                      Cancel
                    </div>
                  </button>
                </div>
              </div>
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default UserProfile;
