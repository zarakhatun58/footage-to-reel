import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading, refreshToken } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Step 1: Save token from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/gallery");
    }
  }, []);

  // ✅ Step 2: Fetch photos safely with auto-refresh
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let token = user?.token || localStorage.getItem("token");
      if (!token) return;

      const load = async (authToken: string) => {
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        return res.data.mediaItems || [];
      };

      try {
        const items = await load(token);
        setPhotos(items);
      } catch (err: any) {
        // Token expired → refresh
        if ((err.response?.status === 401 || err.response?.data?.error === "Google account needs re-login.") && refreshToken) {
          const newToken = await refreshToken();
          if (!newToken) return;
          localStorage.setItem("token", newToken);
          token = newToken;
          const items = await load(token);
          setPhotos(items);
        }
        // Missing scope → redirect to consent
        else if (err.response?.data?.needsScope && err.response?.data?.url) {
          window.location.href = err.response.data.url;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
  }, [user, isAuthenticated]);

  if (authLoading) return <p>Loading authentication...</p>;
  if (!isAuthenticated) return <p>Please log in to view your Google Photos.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Gallery</h1>
      {loading && <p>Loading photos...</p>}
      {photos.length > 0 ? (
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
      ) : (
        !loading && <p>No photos found.</p>
      )}
    </div>
  );
};

export default Gallery;
