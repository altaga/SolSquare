import Home from "./pages/Home";

import { Route, Routes } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { PhantomProvider, WindowWithSolana } from "./types/provider";

function App() {
  const [walletAvail, setWalletAvail] = useState(false);
  const [provider, setProvider] = useState<any | null>(null);
  const [connected, setConnected] = useState(false);
  const [pubKey, setPubKey] = useState<PublicKey | null>(null);

  useEffect(() => {
    if ("solana" in window) {
      const solWindow = window as WindowWithSolana;
      if (solWindow?.solana?.isPhantom) {

        setProvider(solWindow.solana);
        setWalletAvail(true);
        // Attemp an eager connection
        solWindow.solana.connect({ onlyIfTrusted: true });
      }
    }
  }, []);

  useEffect(() => {
    provider?.on("connect", (publicKey: PublicKey) => {
      console.log(`connect event: ${publicKey}`);
      setConnected(true);
      setPubKey(publicKey);
    });
    provider?.on("disconnect", () => {
      console.log("disconnect event");
      setConnected(false);
      setPubKey(null);
    });
  }, [provider]);

  const connectHandler: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    console.log(`connect handler`);
    provider?.connect().catch((err:any) => {
      console.error("connect ERROR:", err);
    });
  };

  const disconnectHandler: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    console.log("disconnect handler");
    provider?.disconnect().catch((err:any) => {
      console.error("disconnect ERROR:", err);
    });
  };
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              disconnectHandler={disconnectHandler}
              connectHandler={connectHandler}
              walletAvail={walletAvail}
              connected={connected}
              pubKey={pubKey}
              provider={provider}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
