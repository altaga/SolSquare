"use client";
import "../styles/styles.css";
import { ThemeProvider } from "@emotion/react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";
import theme from "../styles/theme";

export default function WalletComponent({ children }) {
  const wallets = useMemo(() => [], []);
  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_RPC_SOLANA}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
