import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";

type Photo = {
  id: string;
  baseUrl: string;
  filename?: string;
};



const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/google-photos`);
      setPhotos(res.data.mediaItems || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load Google Photos. Make sure you granted permission.");
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
