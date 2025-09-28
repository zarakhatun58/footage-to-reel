import { BASE_URL } from "@/services/apis";
import React, { useEffect, useState } from "react";

const Gallery = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Google Photos from backend
    const fetchPhotos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Replace with your actual API endpoint
            const res = await fetch(`${BASE_URL}/api/google-photos`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // your JWT token
                },
            });

            if (!res.ok) throw new Error("Failed to fetch photos");

            const data = await res.json();
            // Google Photos API returns mediaItems array
            setPhotos(data.mediaItems || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    if (loading) return <p>Loading photos...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!photos.length) return <p>No photos found</p>;

    return (
        <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 m-auto">
            <h3 className="gradient-text mt-40">Visit You Gallery</h3>
            {photos.map((item) => (
                <div key={item.id} className="photo border rounded overflow-hidden">
                    <img
                        src={item.baseUrl + "=w400-h400"} // adjust size with URL params
                        alt={item.filename || "Google Photo"}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
};

export default Gallery;
