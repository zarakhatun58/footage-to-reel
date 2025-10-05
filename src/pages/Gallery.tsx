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
   const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get("https://your-backend.com/api/auth/google-photos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotos(res.data.mediaItems || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (!photos.length) return <p>No photos found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Google Photos Gallery</h1>
      {loading && <p>Loading photos...</p>}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={`${photo.baseUrl}=w300-h300`}
              alt={photo.filename || "Photo"}
              className="rounded-lg shadow"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default Gallery;
