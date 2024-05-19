"use client";
// context/OwnerContext.js
import { createContext, useContext, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { userSchema, addUserSchema } from "../utils/schema";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  completeStringWithSymbol,
  generateRandomString,
  getTimeDifference,
  modalStyle,
  modalStyleMobile,
} from "../utils/utils";
import { deserialize, serialize } from "borsh";
import TransactionToast from "../components/TransactionToast";

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);

const OwnerContext = createContext();

export const OwnerProvider = ({ children }) => {
  const [ownerToIndexMap, setOwnerToIndexMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { connection } = useConnection();
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [pubkey, setPubkey] = useState(null);
  const [rendered, setRendered] = useState(false);

  const { publicKey, sendTransaction, connecting, disconnecting, connected } =
    useWallet();

  const getBalance = useCallback(async () => {
    const balance = await connection.getBalance(publicKey);
    setBalance(balance);
  }, [publicKey, connection]);

  const getUsers = useCallback(async () => {
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 76, // number of bytes
        },
      ],
    });
    let users = accounts.map((user) => {
      return {
        ...deserialize(userSchema, user.account.data),
        addressPDA: user.pubkey.toBase58(),
        balance: user.account.lamports,
      };
    });
    users = users.map((user) => {
      return {
        ...user,
        username: user.username.replaceAll("~", ""),
        owner: new PublicKey(user.owner).toBase58(),
      };
    });
    setUsers(users);
  }, [connection]);

  return (
    <OwnerContext.Provider
      value={{
        ownerToIndexMap,
        setOwnerToIndexMap,
        loading,
        setLoading,
        users,
        setUsers,
        connection,
        getUsers,
        balance,
        getBalance,
        rendered,
        setRendered
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => {
  return useContext(OwnerContext);
};
