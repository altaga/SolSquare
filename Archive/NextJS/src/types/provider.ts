import { PublicKey } from "@solana/web3.js";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export interface PhantomProvider {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isPhantom: boolean;
  signAndSendTransaction: (transaction:any) => Promise<void>;
    signTransaction: (transaction:any) => Promise<any>;
}

export type WindowWithSolana = Window & {
  solana?: PhantomProvider;
};
