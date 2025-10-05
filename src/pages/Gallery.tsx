import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

type Photo = {
  id: string;
  baseUrl: string;
  filename?: string;
};

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Capture token from redirect
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const token = params.get("token");
  //   if (token) {
  //     localStorage.setItem("token", token);
  //     window.history.replaceState({}, document.title, "/gallery");
  //   }
  // }, []);

  // const getToken = () => localStorage.getItem("token");

  // const fetchPhotos = async () => {
  //   const token = getToken();
  //   if (!token) return setError("Please log in first.");

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (res.data?.needsScope) {
  //       setError("Google Photos access required. Please log in again.");
  //       setPhotos([]);
  //       return;
  //     }

  //     setPhotos(res.data.mediaItems || []);
  //   } catch (err: any) {
  //     setError(err.response?.data?.error || "Failed to fetch photos");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (getToken()) fetchPhotos();
  // }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;

    localStorage.setItem("token", token);

    axios
      .get("https://footage-flow-server.onrender.com/api/auth/google-photos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPhotos(res.data.mediaItems || []))
      .catch((err) => console.error("Failed to load photos", err));
  }, []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Gallery</h1>
      {loading && <p>Loading photos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={`${photo.baseUrl}=w300-h300`}
              alt={photo.filename || "Photo"}
              className="rounded-lg shadow"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default Gallery;
