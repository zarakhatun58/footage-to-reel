import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "@/services/apis";

const Gallery = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const fetchPhotos = async () => {
    if (!user?.token) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/api/auth/google-photos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPhotos(res.data.mediaItems || []);
      console.log(res.data.mediaItems, "photos")
    } catch (err: any) {
      // Only show a generic error
      console.error("[Gallery] fetchPhotos error:", err.response?.data || err.message);
      setError("Failed to load photos.");
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
