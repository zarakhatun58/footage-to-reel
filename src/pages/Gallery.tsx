import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";
import { useNavigate } from "react-router-dom";

type Photo = {
  id: string;
  baseUrl: string;
  filename?: string;
};

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleGallery = async () => {
      setLoading(true);

      // 1️⃣ Check token from URL or localStorage
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const token = tokenFromUrl || localStorage.getItem("token");

      if (!token) {
        setError("Please log in with Google first.");
        setLoading(false);
        return;
      }

      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        // Clean URL
        navigate("/gallery", { replace: true });
      }

      try {
        // 2️⃣ Try fetching Google Photos
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotos(res.data.mediaItems || []);
      } catch (err: any) {
        console.error("Failed to load photos:", err.response?.data || err.message);

        // 3️⃣ Handle missing Photos scope
        if (err.response?.status === 403 || err.response?.data?.error?.includes("scope")) {
          try {
            const scopeRes = await axios.get(`${BASE_URL}/api/auth/google-photos-scope`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (scopeRes.data.url) {
              // Redirect user to Google consent page to grant Photos scope
              window.location.href = scopeRes.data.url;
              return;
            }
          } catch (scopeErr) {
            console.error("Failed to request Photos scope:", scopeErr);
          }
        }

        setError("Failed to load Google Photos. Make sure you granted permission.");
      } finally {
        setLoading(false);
      }
    };

    handleGallery();
  }, [navigate]);

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
