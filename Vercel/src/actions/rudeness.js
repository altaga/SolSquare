"use server";
require("@tensorflow/tfjs");
import * as toxicity from "@tensorflow-models/toxicity";

// The minimum prediction confidence.
const threshold = 0.9;

// Which toxicity labels to return.
const labelsToInclude = [
  "toxicity",
  "severe_toxicity",
  "identity_attack",
  "insult",
  "threat",
  "sexual_explicit",
  "obscene",
];

const model = await toxicity.load(threshold, labelsToInclude);;

export async function predictRudeness(text) {
  return new Promise((resolve, reject) => {
    model
      .classify(text)
      .then((predictions) => {
        resolve(predictions);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
