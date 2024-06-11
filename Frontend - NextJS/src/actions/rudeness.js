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
        const result = predictions.map((item) => {
          return {
            value: item.results[0].match ?? true, // if undefined, return true, because undefined is falsy in JS
            label: item.label,
          };
        })
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
