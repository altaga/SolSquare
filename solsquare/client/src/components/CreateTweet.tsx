import React, { useContext, useState } from "react";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Stack from "@mui/material/Stack";
import { Cancel } from "@mui/icons-material";
import "../App.css";
import { PublicKey } from "@solana/web3.js";
import { create } from "../api/createTweet";
import { PhantomProvider } from "../types/provider";
const Input = styled("input")({
  display: "none",
});

export default function Share({
  fetchPosts,
  pubKey,
  provider,
}: {
  fetchPosts: () => void;
  pubKey: PublicKey | null;
  provider: PhantomProvider | null;
}) {
  const [desc, setDesc] = useState("");
  // const [file, setFile] = useState(null);
  const isFormValid = () => {
    return desc !== "";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let result = await create(desc, pubKey,provider);
      if (result) {
        fetchPosts();
      }
      setDesc("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="share">
      <form encType="multipart/form-data">
        <div className="shareWrapper">
          <div className="shareTop">
            <img
              className="shareProfileImg"
              src={"/assets/person/1.jpg"}
              alt=""
            />
            <input
              placeholder="What's Happening?"
              className="shareInput"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
            />
          </div>
          <hr className="shareHr" />

          <div className="shareBottom">
            <div className="shareOption">
              <Stack direction="row" alignItems="center" spacing={2}>
                <label htmlFor="contained-button-file">
                  <Input
                    accept="image/*"
                    id="contained-button-file"
                    multiple
                    type="file"
                    // onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </Stack>
            </div>
            <Button
              variant="contained"
              type="submit"
              disabled={!isFormValid()}
              onClick={handleSubmit}
            >
              Create Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
