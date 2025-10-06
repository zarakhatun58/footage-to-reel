import React, { useEffect, useState } from "react";
import axios from "axios";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setError("Please log in with Google to view your photos.");
      return;
    }

    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setPhotos(res.data.mediaItems || []);
      } catch (err: any) {
        console.error("❌ Error fetching photos:", err);

        // 🧠 If token expired (401), auto refresh and retry
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axios.get(
              `${BASE_URL}/api/auth/refresh-token`,
              { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            const newToken = refreshRes.data.accessToken;
            if (newToken) {
              localStorage.setItem("token", newToken);
              // Retry fetching photos
              const retry = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              setPhotos(retry.data.mediaItems || []);
              return;
            }
          } catch (refreshErr) {
            console.error("Failed to refresh token:", refreshErr);
            localStorage.removeItem("token");
            setError("Session expired. Please log in again.");
          }
        } else {
          setError("Failed to load Google Photos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Google Photos Gallery
      </h1>

      {loading && <p className="text-center text-gray-500">Loading photos...</p>}
      {error && <p className="text-center text-red-500 font-medium">{error}</p>}

      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={`${photo.baseUrl}=w400-h400`}
              alt={photo.filename || "Google Photo"}
              className="rounded-lg shadow hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
