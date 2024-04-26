import React, { useEffect, useState, useContext } from "react";

import Post from "./Post";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import "../App.css";
import CreateTweet from "./CreateTweet";
export default function Feed({ posts }: { posts: Array<object> }) {
  return (

      <div className="feed">
        <CreateTweet />
       
        {posts.map((post) => {
          return <Post post={post}/>;
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
