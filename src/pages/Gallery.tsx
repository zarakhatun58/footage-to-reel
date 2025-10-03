import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // assumes you store JWT here

const Gallery = () => {
  const { user } = useAuth(); // user has { token, ... }
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPhotos = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/google-photos`,
        {
          headers: { Authorization: `Bearer ${user.token}` }, // ✅ always send token
        }
      );
      setPhotos(res.data.mediaItems || []);
    } catch (err: any) {
      console.error("fetchPhotos error:", err.response?.data || err.message);

      if (err.response?.status === 403) {
        // ✅ Insufficient scopes → ask for Photos permission
        try {
          const scopeRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/auth/google-photos-scope`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );

          if (scopeRes.data.url) {
            window.location.href = scopeRes.data.url; // redirect to Google OAuth
          }
        } catch (scopeErr: any) {
          console.error("scope request error:", scopeErr.response?.data || scopeErr.message);
          setError("Failed to request Google Photos access.");
        }
      } else {
        setError("Failed to load photos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchPhotos();
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Gallery</h1>

      {loading && <p>Loading photos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={`${photo.baseUrl}=w300-h300`}
            alt={photo.filename || "Photo"}
            className="rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
