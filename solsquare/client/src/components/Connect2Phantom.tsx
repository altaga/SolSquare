import { FC, MouseEventHandler } from "react";
import { PublicKey } from "@solana/web3.js";

const Connect2Phantom: FC<{
  walletAvail: any;
  connected: boolean | undefined;
  connectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  disconnectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  pubKey: PublicKey | null;
}> = (props) => {
  const { walletAvail, connected, connectHandler, disconnectHandler } = props;

  return (
    <div>
      {walletAvail ? (
        <>
          {!connected && (
            <button disabled={connected} onClick={connectHandler}>
              Connect to Phantom
            </button>
          )}
          {connected && (
            <button disabled={!connected} onClick={disconnectHandler}>
              Disconnect from Phantom
            </button>
          )}
        </>
      ) : (
        <>
          <p>
            Opps!!! Phantom is not available. Go get it{" "}
            <a href="https://phantom.app/">https://phantom.app/</a>.
          </p>
        </>
      )}
    </div>
  );
};

export default Connect2Phantom;
