import * as faceapi from "face-api.js";

/**
 * Load the required face-api.js models from public/models
 */
export const loadModels = async (): Promise<void> => {
  const MODEL_URL = "/models";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
};

/**
 * Detect the most prominent emotion in a given image
 * @param image HTMLImageElement or HTMLVideoElement
 * @returns Top emotion with probability
 */
export const detectEmotions = async (
  image: HTMLImageElement | HTMLVideoElement
): Promise<{ expression: string; probability: number } | null> => {
  const detections = await faceapi
    .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (detections.length === 0) return null;

  const topEmotion = detections[0].expressions.asSortedArray()[0]; // sorted by probability
  return topEmotion;
};
