"use client";

import { Home, Search } from "@mui/icons-material";
// Styled buttons and inputs
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
// Solana Core modules
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import Image from "next/image";
// NextJS modules
import Link from "next/link";
// React modules
import React, { useCallback, useEffect, useRef, useState } from "react";
// React Toastify
import { toast } from "react-toastify";

export default function Address() {
  // Detect if device has a touch screen, then a mobile device, its not perfect, but it simplifies the code
  const isTouchScreen = "ontouchstart" in window || navigator.msMaxTouchPoints;
  // We use the wallet hooks to interact with the blockchain
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  // States and refs for the UI
  const [selector, setSelector] = useState(0);
  const [balance, setBalance] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const message = useRef();
  const sendAddress = useRef();
  const amount = useRef();

  // Toast notification

  const transactionToast = (txhash) => {
    // Notification can be a component, a string or a plain object
    toast(
      <div>
        {"Requested airdrop TX: "}
        <br />
        <Link
          href={`https://explorer.solana.com/tx/${txhash}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {txhash}
        </Link>
      </div>
    );
  };

  // Ignore useCallback, its for performance

  // Get balance of the connected wallet
  const getBalance = useCallback(async () => {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance);
  }, [publicKey, connection]);

  // Request airdrop from devnet
  const requestAirdrop = useCallback(async () => {
    let txhash = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    transactionToast(txhash);
  }, [publicKey, connection]);

  // Send SOL from the connected wallet to another address
  const sendSol = useCallback(async () => {
    // All actions on the blockchain must be done through transactions, with a (normally very low) cost of SOL
    // READ HERE: https://solana.com/docs/core/transactions
    const transaction = new Transaction().add(
      // SystemProgram.transfer() transfers SOL from one account to another, this is part of web3.js core
      // There is a lot of predefined methods, check them out here: https://solana-labs.github.io/solana-web3.js/classes/SystemProgram.html
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(sendAddress.current.value),
        lamports: amount.current.value * LAMPORTS_PER_SOL,
      })
    );
    const signature = await sendTransaction(transaction, connection);
    transactionToast(signature);
  }, [publicKey, connection, sendAddress, amount, sendTransaction]);

  // Send Memo from the connected wallet
  const sendMessage = useCallback(async () => {
    const transaction = new Transaction().add(
      // TransactionInstruction is an instruction that will be executed on the blockchain by the program specified in programId, every program has its own programId and data structure.
      new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(message.current.value, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      })
    );
    const signature = await sendTransaction(transaction, connection);
    transactionToast(signature);
  }, [publicKey, connection, message, sendTransaction]);

  // Detect when wallet is connected and get balance
  useEffect(() => {
    if (publicKey) {
      getBalance();
    }
  }, [publicKey, getBalance]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "96vw",
      }}
    >
      {
        // Header Bar
      }
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        {
          // Show on header bar if wallet is connected with the wallet button
        }
        <Link href="/">
          <Image src="/logoW.png" alt="logo" width={70} height={70} />
        </Link>
      </div>
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {
          // Show on header bar if wallet is connected with the wallet button
        }
        <WalletMultiButton />
      </div>
      {
        // Content
      }
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
          maxWidth: "70vw",
        }}
      >
        {
          // Selector Buttons
        }
        <ButtonGroup
          variant="contained"
          // If device has a touch screen (mobile) then its vertical else horizontal
          orientation={isTouchScreen ? "vertical" : "horizontal"}
          aria-label="Basic button group"
          color="phantom"
        >
          <Button
            onClick={() => setSelector(0)}
            variant={selector !== 0 ? "contained" : "outlined"}
            style={{
              fontSize: "1.3rem",
            }}
          >
            Basic Info
          </Button>
          <Button
            onClick={() => setSelector(1)}
            variant={selector !== 1 ? "contained" : "outlined"}
            style={{
              fontSize: "1.3rem",
            }}
          >
            Request Airdrop
          </Button>
          <Button
            onClick={() => setSelector(2)}
            variant={selector !== 2 ? "contained" : "outlined"}
            style={{
              fontSize: "1.3rem",
            }}
          >
            Send Transaction
          </Button>
          <Button
            onClick={() => setSelector(3)}
            variant={selector !== 3 ? "contained" : "outlined"}
            style={{
              fontSize: "1.3rem",
            }}
          >
            Interact with Program
          </Button>
        </ButtonGroup>
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#512da8",
            margin: "1rem",
          }}
        />
        {
          // Depending on the selector, show different content (conditional rendering)
        }
        {selector === 0 && (
          <React.Fragment>
            <h2
              style={{
                color: "black",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>Address : </div>
              <Link
                href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {
                  // If the device has a touch screen, only show the first 22 characters of the address
                  // Otherwise, show the full address
                }
                {isTouchScreen ? (
                  <React.Fragment>
                    {publicKey?.toBase58().substring(0, 22)}
                    <br />
                    {publicKey?.toBase58().substring(22)}
                  </React.Fragment>
                ) : (
                  publicKey?.toBase58()
                )}
              </Link>
              <div
                style={{
                  marginTop: "2rem",
                  fontSize: "1.5rem",
                }}
              >
                {
                  // Lamports is a unit of SOL, 1 SOL is 1,000,000,000 (10^9) lamports, when you call getBalance, you get the balance in lamports, to show the balance in SOL, we divide by 10^9 or LAMPORTS_PER_SOL
                }
                {`SOL Balance : ${balance / LAMPORTS_PER_SOL}`}
              </div>
            </h2>
          </React.Fragment>
        )}
        {selector === 1 && (
          <React.Fragment>
            <h2
              style={{
                color: "black",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>
                You can request 1 SOL airdrop (ONLY DEVNET)
              </div>
              <br />
              <Button
                onClick={() => requestAirdrop()}
                variant="contained"
                color="phantom"
                style={{
                  fontSize: "1.5rem",
                }}
              >
                Request Airdrop
              </Button>
            </h2>
          </React.Fragment>
        )}
        {selector === 2 && (
          <React.Fragment>
            <div style={{ fontSize: "1.5rem", textAlign: "center" }}>
              {"Send X amount of SOL from your address to another address"}
            </div>
            {
              // If device has a touch screen (mobile), show the form vertically else horizontally
            }
            {isTouchScreen ? (
              <React.Fragment>
                <TextField
                  id="outlined-basic"
                  label="Address"
                  type="text"
                  variant="outlined"
                  inputRef={sendAddress}
                  color="phantom"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="Amount"
                  type="number"
                  variant="outlined"
                  inputRef={amount}
                  color="phantom"
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                  }}
                />
              </React.Fragment>
            ) : (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <TextField
                  id="outlined-basic"
                  label="Address"
                  type="text"
                  variant="outlined"
                  inputRef={sendAddress}
                  color="phantom"
                  style={{
                    width: "80%",
                  }}
                />
                <TextField
                  id="outlined-basic"
                  label="Amount"
                  type="number"
                  variant="outlined"
                  inputRef={amount}
                  color="phantom"
                  style={{
                    width: "20%",
                  }}
                />
              </div>
            )}
            <h2
              style={{
                color: "black",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              <Button
                onClick={() => sendSol()}
                variant="contained"
                color="phantom"
                style={{
                  fontSize: "1.5rem",
                }}
              >
                Send SOL
              </Button>
            </h2>
          </React.Fragment>
        )}
        {selector === 3 && (
          <React.Fragment>
            <div style={{ fontSize: "1.5rem", textAlign: "center" }}>
              {"Interact with Memo Program"}
            </div>
            <TextField
              id="outlined-basic"
              label="Message"
              type="text"
              variant="outlined"
              inputRef={message}
              color="phantom"
              style={{
                width: "100%",
                marginBottom: "1rem",
                marginTop: "1rem",
              }}
            />
            <Button
              onClick={() => sendMessage()}
              variant="contained"
              color="phantom"
              style={{
                fontSize: "1.5rem",
              }}
            >
              Send Message to Memo Program
            </Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
