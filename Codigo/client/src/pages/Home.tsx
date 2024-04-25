import React, { useState } from "react";
import TopBar from "../components/TopBar";
import "../App.css";
import Feed from "../components/Feed";

export default function Home() {
  const [posts, setPosts] = useState([]);

  return (
    <>
      <TopBar />
      <div className="homeContainer">
        <Feed posts={posts} />
      </div>
    </>
  );
}
