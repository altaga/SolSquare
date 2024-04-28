import React, { MouseEventHandler, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import "../App.css";
import Feed from "../components/Feed";
import { getTweet } from "../api/getTweet";
import { PublicKey } from "@solana/web3.js";
import { PhantomProvider } from "../types/provider";
export default function Home({
  walletAvail,
  connected,
  connectHandler,
  disconnectHandler,
  pubKey,
  provider
}: {
  walletAvail: any;
  connected: boolean | undefined;
  connectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  disconnectHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  pubKey: PublicKey | null;
  provider: PhantomProvider | null;
}) {
  const [posts, setPosts] = useState([]);

  const fetchPosts = () => {
    setTimeout(() => {
      getTweet().then((tweets) => {
        setPosts(tweets);
      });
    }, 1000);
  };
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <TopBar
        disconnectHandler={disconnectHandler}
        connectHandler={connectHandler}
        walletAvail={walletAvail}
        connected={connected}
        pubKey={pubKey}
      />
      <div className="homeContainer">
        <Feed posts={posts} fetchPosts={fetchPosts} connected={connected} pubKey={pubKey} provider={provider}/>
      </div>
    </>
  );
}
