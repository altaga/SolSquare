import React from "react";
import { toast } from "react-toastify";

const TransactionToast = (txhash, message) => {
  // Notification can be a component, a string or a plain object
  return toast(
    <div>
      {message}:
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

export default TransactionToast;
