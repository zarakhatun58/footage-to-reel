import { BASE_URL } from "@/services/apis";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Gallery = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch photos from backend ---
  const fetchPhotos = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/api/auth/google-photos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data?.error?.toLowerCase().includes("scope")) {
          setError("Google Photos access not granted. Please grant access.");
        } else {
          setError(data?.error || "Failed to fetch photos.");
        }
        setPhotos([]);
        return;
      }

      setPhotos(data.mediaItems || []);
    } catch (err) {
      console.error("Fetch photos error:", err);
      setError("Network error while fetching photos.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Request Google Photos permission ---
  const requestPhotosAccess = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/google-photos-scope`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Google OAuth consent
      } else {
        setError("Failed to get Google Photos authorization URL.");
      }
    } catch (err) {
      console.error("Error requesting Photos scope:", err);
      setError("Failed to request Google Photos access.");
    }
  };

  // --- Refetch if redirected after granting photos scope ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("photosScopeGranted") === "true") {
      fetchPhotos();
      navigate("/gallery", { replace: true }); // clean URL
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
    else setLoading(false);
  }, [isAuthenticated]);

  // --- UI states ---
  if (loading) return <p className="text-center mt-8">Loading photos...</p>;

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500 mb-4">{error}</p>
        {error.includes("grant access") && (
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={requestPhotosAccess}
          >
            Grant Google Photos Access
          </button>
        )}
      </div>
    );
  }

  if (!photos.length) {
    return <p className="text-center mt-8">No photos found.</p>;
  }

  // --- Render photos ---
  return (
    <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 m-auto h-[600px] overflow-y-auto">
      <h3 className="col-span-full text-xl font-semibold mb-4">Google Photos</h3>
      {photos.map((item) => (
        <div key={item.id} className="photo border rounded overflow-hidden">
          <img
            src={item.baseUrl + "=w400-h400"}
            alt={item.filename || "Google Photo"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
