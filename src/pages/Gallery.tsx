import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";

type Photo = {
  id: string;
  baseUrl: string;
  filename?: string;
};

// ✅ Setup Axios interceptors only once
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await axios.get(`${BASE_URL}/api/auth/refresh-token`);
        const newToken = refresh.data.accessToken;
        if (newToken) {
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch {
        localStorage.removeItem("token");
        window.location.href = `${BASE_URL}/api/auth/google`; // fallback login
      }
    }
    return Promise.reject(error);
  }
);

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Save token if redirected back with ?token=
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in with Google to continue.");
      return;
    }

    const fetchPhotos = async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ 1. Try fetching photos
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`);
        setPhotos(res.data.mediaItems || []);
      } catch (err: any) {
        const msg = err?.response?.data?.error || err.message;
        console.error("❌ Error fetching photos:", msg);

        // ✅ 2. If missing scope, request permission automatically
        if (
          msg.includes("insufficient authentication scopes") ||
          err.response?.status === 403
        ) {
          try {
            const scopeRes = await axios.get(
              `${BASE_URL}/api/auth/request-photos-scope`
            );
            if (!scopeRes.data.hasPhotosScope && scopeRes.data.url) {
              window.location.href = scopeRes.data.url; // redirect to Google consent
              return;
            }
          } catch (scopeErr) {
            console.error("Failed to request Photos scope:", scopeErr);
            setError("Failed to request Google Photos permission.");
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
