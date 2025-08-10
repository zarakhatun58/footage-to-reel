import React, { useEffect, useState, useRef } from "react";
import { gapi } from "gapi-script";
import { API_KEY, GOOGLE_CLIENT_ID } from "@/App";

declare class MediaUploader {
  constructor(options: {
    baseUrl: string;
    file: File;
    token: string;
    metadata?: any;
    params?: Record<string, string>;
    onError?: (error: string) => void;
    onProgress?: (progress: { loaded: number; total: number }) => void;
    onComplete?: (response: string) => void;
  });
  upload(): void;
}

const SCOPES = "https://www.googleapis.com/auth/youtube.upload";

const YoutubeConnect: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function start() {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
          ],
          scope: SCOPES,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
          if (authInstance.isSignedIn.get()) {
            const user = authInstance.currentUser.get();
            setAccessToken(user.getAuthResponse().access_token);
          }
        })
        .catch(console.error);
    }
    gapi.load("client:auth2", start);
  }, []);

  const handleLogin = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn().then((user: any) => {
      const token = user.getAuthResponse().access_token;
      setAccessToken(token);
    });
  };

  const uploadFile = (file: File) => {
    if (!accessToken) {
      alert("You must be logged in to upload");
      return;
    }
    setUploadProgress(0);
    setUploadStatus("Uploading...");

    const metadata = {
      snippet: {
        title: file.name,
        description: "Uploaded via React frontend",
        tags: ["test"],
        categoryId: "22",
      },
      status: {
        privacyStatus: "private",
      },
    };

    const uploader = new MediaUploader({
      baseUrl: "https://www.googleapis.com/upload/youtube/v3/videos",
      file,
      token: accessToken,
      metadata,
      params: { part: "snippet,status" },
      onError: (error) => {
        setUploadStatus("Upload failed: " + error);
      },
      onProgress: (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        setUploadProgress(percent);
      },
      onComplete: (response) => {
        const res = JSON.parse(response);
        setVideoId(res.id);
        setUploadStatus("Upload complete!");
      },
    });

    uploader.upload();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div>
      <div className="w-full h-5 bg-gray-200 rounded-lg overflow-hidden mt-2">
        <div
          className="h-full rounded-l-lg bg-gradient-to-r from-orange-500 to-orange-300 shadow-md animate-pulse"
          style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}
        />
      </div>
      {/* {!isSignedIn ? ( */}
        <button onClick={handleLogin}>Login with Google</button>
      {/* ) : ( */}
        <div>
          <p>Signed in</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <progress value={uploadProgress} max={100} />
          <p>{uploadStatus}</p>
          {videoId && (
            <p>
              Video uploaded:{" "}
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch here
              </a>
            </p>
          )}
        </div>
      {/* )} */}
    </div>
  );
};

export default YoutubeConnect;
