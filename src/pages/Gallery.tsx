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

      if (!res.ok) {
        if (res.status === 403) {
          // Photos scope missing or token invalid
          setError("You need to re-login to grant access to Google Photos.");
        } else if (res.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          const data = await res.json();
          setError(data?.error || "Failed to fetch photos.");
        }
        setPhotos([]);
        return;
      }

      const data = await res.json();
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
  if (error)
    return (
      <div className="text-center mt-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          onClick={() => {
            // Redirect to Google login
            window.location.href = "/login"; // or your Google login route
          }}
        >
          Re-login with Google
        </button>
      </div>
    );
  if (!photos.length) return <p className="text-center mt-8">No photos found.</p>;

  return (
    <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 m-auto">
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

