import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

export const EmotionDetector = () => {
  const [file, setFile] = useState<File | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        console.log("Models loaded");
      } catch (err) {
        console.error("Failed to load models", err);
      }
    };
    loadModels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setEmotion(null);
    setPreviewURL(URL.createObjectURL(uploaded));
  };

  const detectFromImage = async () => {
    if (!imageRef.current) return;
    const detections = await faceapi
      .detectSingleFace(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections?.expressions) {
      const sorted = Object.entries(detections.expressions).sort(
        (a, b) => b[1] - a[1]
      );
      setEmotion(sorted[0][0]);
    } else {
      setEmotion("No face detected");
    }
  };

  const detectFromVideo = async () => {
    if (!videoRef.current) return;
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections?.expressions) {
      const sorted = Object.entries(detections.expressions).sort(
        (a, b) => b[1] - a[1]
      );
      setEmotion(sorted[0][0]);
    } else {
      setEmotion("No face detected");
    }
  };

  const isImage = file?.type.startsWith("image");
  const isVideo = file?.type.startsWith("video");

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Emotion Detector</h2>
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      {previewURL && isImage && (
        <>
          <img
            src={previewURL}
            ref={imageRef}
            alt="Uploaded"
            onLoad={detectFromImage}
            className="mt-4 max-w-full rounded"
          />
        </>
      )}

      {previewURL && isVideo && (
        <>
          <video
            src={previewURL}
            ref={videoRef}
            onLoadedMetadata={() => videoRef.current?.play()}
            onPlay={detectFromVideo}
            controls
            className="mt-4 max-w-full rounded"
          />
        </>
      )}

      {emotion && (
        <div className="mt-4 text-lg">
          <strong>Detected Emotion:</strong> {emotion}
        </div>
      )}
    </div>
  );
};
