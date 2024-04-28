import React, { useEffect, useState, useContext } from "react";

import Post from "./Post";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import "../App.css";
import CreateTweet from "./CreateTweet";
import { PublicKey } from "@solana/web3.js";
import { PhantomProvider } from "../types/provider";
export default function Feed({
  posts,
  fetchPosts,
  connected,
  pubKey,
  provider,
}: {
  posts: Array<object>;
  fetchPosts: () => void;
  connected: boolean | undefined;
  pubKey: PublicKey | null;
  provider: PhantomProvider | null;
}) {
  return (
    <div className="feed">
      {connected && <CreateTweet fetchPosts={fetchPosts} pubKey={pubKey} provider={provider} />}

      {posts.map((post, index) => {
        return <Post post={post} key={index} />;
      })}

      {/* {posts.length === 0 && (
          <div className="no-post-found">
            <PhotoCameraIcon fontSize="large" sx={{ mt: 6, mb: 0 }} />

            <p className="no-post-text">No Posts Found</p>
          </div>
        )} */}
    </div>
  );
}
