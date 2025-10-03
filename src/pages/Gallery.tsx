import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const fetchPhotos = async (retry = true) => {
  if (!user?.token) return;

  setLoading(true);
  setError("");

  try {
    const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setPhotos(res.data.mediaItems || []);
  } catch (err: any) {
    console.error("[Gallery] fetchPhotos error:", err.response?.data || err.message);

    if ((err.response?.status === 403 || err.response?.status === 401) && retry) {
      try {
        const scopeRes = await axios.get(`${BASE_URL}/api/auth/google-photos-scope`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Redirect user to consent screen if needed
        if (scopeRes.data?.url) {
          const consentWindow = window.open(scopeRes.data.url, "_blank", "width=500,height=600");

          // Poll until the consent screen closes, then retry fetching
          const checkInterval = setInterval(async () => {
            if (consentWindow?.closed) {
              clearInterval(checkInterval);
              console.log("[Gallery] Consent granted, retrying fetchPhotos...");
              fetchPhotos(false); // retry once
            }
          }, 1000);

          return;
        }

        if (!scopeRes.data.hasPhotosScope) {
          setError("Google Photos access not granted. Please re-connect your account.");
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
  }
};


useEffect(() => {
  if (user?.token) {
    fetchPhotos();
  }
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
