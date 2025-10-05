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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsScope, setNeedsScope] = useState(false);

  const getValidToken = (): string | null => user?.token || localStorage.getItem("token");

  // ✅ Capture redirect token (after Google login)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/gallery");
      console.log("[Gallery] ✅ Saved token from Google redirect:", token);
    }
  }, []);

  // ✅ Centralized API call with token + auto refresh
  const fetchWithAuth = async (endpoint: string, token: string) => {
    try {
      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      // Token expired → try refresh once
      if (err.response?.status === 401) {
        console.warn("[Gallery] Token expired — refreshing...");
        const refreshRes = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
          userId: user?.id,
        });
        const newToken = refreshRes.data?.token;
        if (!newToken) throw new Error("Token refresh failed");
        localStorage.setItem("token", newToken);
        console.log("[Gallery] ✅ Token refreshed, retrying request...");
        const retry = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        return retry.data;
      }
      throw err;
    }
  };

  // ✅ Fetch Google Photos
  const fetchPhotos = async () => {
    setLoading(true);
    setError("");
    setNeedsScope(false);
    try {
      const token = getValidToken();
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      console.log("[Gallery] Fetching photos with token...");
      const data = await fetchWithAuth("/api/auth/google-photos", token);

      if (data?.needsScope) {
        setNeedsScope(true);
        setError("Google Photos access required. Please grant permission.");
        return;
      }

      setPhotos(data.mediaItems || []);
      console.log("[Gallery] ✅ Photos loaded:", data.mediaItems?.length || 0);
    } catch (err: any) {
      console.error("[Gallery] ❌ API Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load after authentication
  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
  }, [user, isAuthenticated]);

  // ✅ Handle “Grant Permission” button
  const handleGrantScope = async () => {
    try {
      const token = getValidToken();
      if (!token) return setError("No user token found.");
      console.log("[Gallery] Requesting Photos permission...");

      const res = await axios.get(`${BASE_URL}/api/auth/request-photos-scope`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.url) {
        window.open(res.data.url, "_blank", "width=600,height=700");
      } else {
        setError("Failed to get authorization URL.");
      }
    } catch (err: any) {
      console.error("[Gallery] Error requesting scope:", err.response?.data || err);
      setError("Error requesting Google Photos permission.");
    }
  };

  // ✅ UI
  if (authLoading) return <p>Loading authentication...</p>;
  if (!isAuthenticated) return <p>Please log in to view your Google Photos.</p>;


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Gallery</h1>

      {loading && <p>Loading photos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {needsScope && (
        <button
          onClick={handleGrantScope}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2"
        >
          Grant Google Photos Access
        </button>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
        !loading && !needsScope && <p>No photos found.</p>
      )}
    </div>
  );
};
export default Gallery;
