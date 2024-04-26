import React, { useState } from "react";

import moment from "moment";
import { ThumbDownOffAlt } from "@mui/icons-material";

import FavoriteIcon from "@mui/icons-material/Favorite";

import "../App.css";
export default function Post({ post }: { post: any }) {
  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft" style={{ cursor: "pointer" }}>
            <img
              className="postProfileImg"
              src={"/assets/person/1.jpg"}
              alt=""
            />
            <span className="postUsername">{post.owner}</span>
            <span className="postDate">
              {moment(post.timestamp * 1000).format("YYYY-MM-DD HH:mm")}
            </span>
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post.content}</span>
          <img className="postImg" alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <button className="postLikeButton">
              <span className="postLikeText">Boost </span>
            </button>

            <button className="postLikeButton">
              <span className="postDislikeText">Withdraw </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
