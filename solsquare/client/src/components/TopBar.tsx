import React, { MouseEventHandler, useEffect, useState } from "react";
import { Home, Search } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import Connect2Phantom from "./Connect2Phantom";
import { PublicKey } from "@solana/web3.js";

export default function TopBar({
  walletAvail,
  connected,
  connectHandler,
  disconnectHandler,
  pubKey,
}: {
  walletAvail: any;
  connected: boolean | undefined;
  connectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  disconnectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  pubKey: PublicKey | null;
}) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <span
          className="logo"
          onClick={() => {
            navigate("/");
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          X Sol
        </span>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for posts"
            className="searchInput"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="topbarRight">
        <Home
          className="home_button"
          fontSize="medium"
          onClick={() => {
            navigate("/");
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        />
        <span
          className="home_text"
          onClick={() => {
            navigate("/");
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          Home
        </span>
      </div>

      <Connect2Phantom
        disconnectHandler={disconnectHandler}
        connectHandler={connectHandler}
        walletAvail={walletAvail}
        connected={connected}
        pubKey={pubKey}
      />
    </div>
  );
}
