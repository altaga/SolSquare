"use server";
import '@tensorflow/tfjs-backend-cpu'
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

const model = toxicity.load(threshold, labelsToInclude);

export async function predictRudeness(text) {
  const myModel = await model;
  return new Promise((resolve, reject) => {
    myModel
      .classify(text)
      .then((predictions) => {
        resolve(predictions);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
