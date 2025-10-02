import { BASE_URL } from "@/services/apis";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Gallery = () => {
  const { user, isAuthenticated } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Display backend error without forcing re-login
        setError(data?.error || "Failed to fetch photos.");
        setPhotos([]);
        return;
      }

      setPhotos(data.mediaItems || []);
    } catch (err: any) {
      console.error("Fetch photos error:", err);
      setError("Failed to fetch photos due to network error.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPhotos();
    else setLoading(false);
  }, [isAuthenticated]);

  if (loading) return <p className="text-center mt-8">Loading photos...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
  if (!photos.length) return <p className="text-center mt-8">No photos found.</p>;

  return (
    <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 m-auto h-[600px]">
      <h3 className="col-span-full text-xl font-semibold mb-4">Google Photos</h3>
      {photos.map((item) => (
        <div key={item.id} className="photo border rounded overflow-hidden">
          <img
            src={item.baseUrl + "=w400-h400"}
            alt={item.filename || "Google Photo"}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default Gallery;

