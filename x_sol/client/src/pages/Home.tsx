import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import "../App.css";
import Feed from "../components/Feed";
import { getTweet } from "../api/getTweet";
export default function Home() {
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
      <TopBar />
      <div className="homeContainer">
        <Feed posts={posts} fetchPosts={fetchPosts} />
      </div>
    </>
  );
}
