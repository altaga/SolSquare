import React, { useState } from "react";

import moment from "moment";
import { ThumbDownOffAlt } from "@mui/icons-material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import "../App.css";
export default function Post({ post }: { post: any }) {
  const [comment, setComment] = useState("");

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
            <FavoriteIcon color={"error"} cursor="pointer" />

            <span className="postLikeText">1 Like </span>

            <ThumbDownOffAlt cursor="pointer" />

            <span className="postDislikeText">2 DisLike </span>
          </div>
          <div className="postBottomRight">
            <CommentIcon cursor="pointer" />
            <span className="postCommentText"> 3 Comments</span>
          </div>
        </div>

        <div className="writeComment">
          <img
            className="commentProfileImg"
            src={"/assets/person/1.jpg"}
            alt=""
          />
          <input
            placeholder="Write a comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            className="commentInput"
          />
        </div>
      </div>
    </div>
  );
}
