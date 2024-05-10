"use server";

import { completeStringWithSymbol } from "../utils/utils";

// convertCID.js

async function complete64bytes(cid) {
  
}

const cidString = completeStringWithSymbol("bafkreieqskeuyh4spxsgthnfolqogeifaj6mupbilolqn3q3jb7lf3lncy", "▄", 64);
console.log(cidString);


const IPFS_API_TOKEN =
  `Basic ${process.env.IPFS_API_KEY}`;

const BUCKET = process.env.IPFS_BUCKET;

export async function getFilesServer() {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", IPFS_API_TOKEN);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.apillon.io/storage/buckets/${BUCKET}/files`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}
