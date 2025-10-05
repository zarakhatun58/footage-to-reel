import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsScope, setNeedsScope] = useState(false);

  // ✅ Handle OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/gallery");
      console.log("[Gallery] New token saved from redirect:", token);
    }
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    console.log("[Gallery] Fetching photos...");
    try {
      let token = user?.token || localStorage.getItem("token");
      if (!token) {
        console.warn("[Gallery] No token found.");
        setError("No token found. Please log in again.");
        return;
      }

      const fetchFromApi = async (currentToken: string) => {
        console.log("[Gallery] Sending request to /api/auth/google-photos...");
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        console.log("[Gallery] Google Photos response:", res.data);
        return res.data;
      };

      try {
        const data = await fetchFromApi(token);
        setPhotos(data.mediaItems || []);
        console.log("[Gallery] ✅ Loaded photos:", data.mediaItems);
        setError("");
      } catch (err: any) {
        console.error("[Gallery] API Error:", err.response?.data || err);

        const data = err.response?.data;

        // Missing Google Photos scope — show button
        if (data?.needsScope) {
          console.warn("[Gallery] Google Photos scope not granted.");
          setNeedsScope(true);
          setError("Google Photos access required. Please grant permission.");
          return;
        }

        // Token expired — try refresh
        if (data?.error === "Google account needs re-login." || err.response?.status === 401) {
          console.log("[Gallery] Token expired. Attempting refresh...");
          const refreshRes = await axios.post(
            `${BASE_URL}/api/auth/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newToken = refreshRes.data?.token;
          if (!newToken) {
            console.error("[Gallery] Token refresh failed.");
            setError("Session expired. Please log in again.");
            return;
          }

          localStorage.setItem("token", newToken);
          token = newToken;
          console.log("[Gallery] Token refreshed successfully:", newToken);

          const retryData = await fetchFromApi(token);
          setPhotos(retryData.mediaItems || []);
          console.log("[Gallery] ✅ Retried and loaded photos:", retryData.mediaItems);
          setError("");
          return;
        }

        setError(data?.error || "Failed to load photos");
      }
    } catch (err) {
      console.error("[Gallery] Unexpected fetch error:", err);
      setError("Unexpected error while fetching photos");
    } finally {
      setLoading(false);
    }
  };

  // Handle initial fetch
  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
  }, [user, isAuthenticated]);

  // Handle scope grant
  const handleGrantScope = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("No user token found.");
      console.log("[Gallery] Requesting Photos permission grant...");

      const res = await axios.get(`${BASE_URL}/api/auth/request-photos-scope`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[Gallery] Scope request response:", res.data);

      if (res.data.url) {
        window.open(res.data.url, "_blank", "width=600,height=700");
      } else {
        setError("Failed to get authorization URL.");
      }
    } catch (err: any) {
      console.error("[Gallery] Error requesting scope:", err.response?.data || err);
      setError("Error requesting Google Photos permission.");
    }
  };

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
