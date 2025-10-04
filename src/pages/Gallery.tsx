import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Step 1: Grab token from URL (after Google login redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/gallery"); // clean URL
    }
  }, []);

  // ✅ Step 2: Fetch photos using stored token
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPhotos(res.data.mediaItems || []);
      setError("");
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.needsScope && data.url) {
        // Redirect to scope consent screen
        window.location.href = data.url;
        return;
      }

      setError(data?.error || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

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
