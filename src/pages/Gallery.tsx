import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/gallery");
    }
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let token = user?.token || localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      const fetchFromApi = async (currentToken: string) => {
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        return res.data;
      };

      try {
        const data = await fetchFromApi(token);
        setPhotos(data.mediaItems || []);
        setError("");
      } catch (err: any) {
        const data = err.response?.data;

        // Photos scope missing → redirect user to consent
        if (data?.needsScope && data?.url) {
          window.location.href = data.url;
          return;
        }

        // Token expired → refresh token
        if (data?.error === "Google account needs re-login." || err.response?.status === 401) {
          // Call backend refresh-token endpoint
          const refreshRes = await axios.post(
            `${BASE_URL}/api/auth/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newToken = refreshRes.data?.token;
          if (!newToken) {
            setError("Session expired. Please log in again.");
            return;
          }

          localStorage.setItem("token", newToken);
          token = newToken;

          const retryData = await fetchFromApi(token);
          setPhotos(retryData.mediaItems || []);
          setError("");
          return;
        }

        setError(data?.error || "Failed to load photos");
      }
    } catch (err) {
      console.error("Gallery fetchPhotos error:", err);
      setError("Unexpected error while fetching photos");
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
      {error && <p className="text-red-500">{error}</p>}
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
