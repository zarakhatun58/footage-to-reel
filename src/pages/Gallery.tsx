import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPhotos = async () => {
    console.log("[Gallery] fetchPhotos called, user:", user);
    if (!user?.token) return console.log("[Gallery] No token, aborting fetchPhotos");

    setLoading(true);
    setError("");

    try {
      console.log("[Gallery] Requesting Google Photos...");
      const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log("[Gallery] Photos fetched:", res.data);

      setPhotos(res.data.mediaItems || []);
    } catch (err: any) {
      console.error("[Gallery] fetchPhotos error:", err.response?.data || err.message);

      if (err.response?.status === 403) {
        console.log("[Gallery] 403 Forbidden - requesting Google Photos scope...");
        try {
          const scopeRes = await axios.get(`${BASE_URL}/api/auth/google-photos-scope`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          console.log("[Gallery] Scope response:", scopeRes.data);

          if (scopeRes.data.url) {
            console.log("[Gallery] Redirecting to Google OAuth:", scopeRes.data.url);
            window.location.href = scopeRes.data.url;
            return;
          }
        } catch (scopeErr: any) {
          console.error("[Gallery] Scope request error:", scopeErr.response?.data || scopeErr.message);
          setError("Failed to request Google Photos access.");
        }
      } else {
        setError("Failed to load photos.");
      }
    } finally {
      setLoading(false);
      console.log("[Gallery] fetchPhotos finished");
    }
  };

  useEffect(() => {
    console.log("[Gallery] useEffect triggered, user token:", user?.token);
    if (user?.token) fetchPhotos();
  }, [user?.token]);

  if (authLoading) return <p>Loading authentication...</p>;
  if (!isAuthenticated) return <p>Please log in to view your Google Photos.</p>;

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
