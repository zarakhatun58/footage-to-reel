import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";
import { useNavigate, useLocation } from "react-router-dom";

type Photo = {
  id: string;
  baseUrl: string;
  filename?: string;
};

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ Save token if present in URL
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get("token");
        if (tokenFromUrl) {
          localStorage.setItem("token", tokenFromUrl);
          navigate("/gallery", { replace: true });
        }

        // 2️⃣ Fetch token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in with Google first.");
          setLoading(false);
          return;
        }

        // 3️⃣ Check Google Photos scope
        const scopeRes = await axios.get(`${BASE_URL}/api/auth/google-photos-scope`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!scopeRes.data.hasPhotosScope) {
          // 4️⃣ If user hasn't granted permission — redirect to Google OAuth
          const clientId = "495282347288-bj7l1q7f0c5kbk23623sppibg1tml4dp.apps.googleusercontent.com";
          const redirectUri = encodeURIComponent(
            "https://footage-flow-server.onrender.com/api/auth/photos-callback"
          );
          const scope = encodeURIComponent("https://www.googleapis.com/auth/photoslibrary.readonly");
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${scopeRes.data.userId || "state"}`;

          window.location.href = authUrl;
          return;
        }

        // 5️⃣ Fetch photos if permission granted
        const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPhotos(res.data.mediaItems || []);
      } catch (err: any) {
        console.error("Gallery init error:", err);
        setError(
          err.response?.data?.error ||
            "Failed to load Google Photos. Please grant permission again."
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [location, navigate]);

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
