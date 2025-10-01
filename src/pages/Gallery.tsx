import { BASE_URL } from "@/services/apis";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Gallery = () => {
    const { user, isAuthenticated } = useAuth();
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Google Photos from backend
    const fetchPhotos = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user?.token) throw new Error("No auth token found, please login.");

            const res = await fetch(`${BASE_URL}/api/auth/google-photos`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to fetch photos");
            }

            const data = await res.json();
            setPhotos(data.mediaItems || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchPhotos();
        } else {
            setLoading(false);
            setError("You must be logged in to view photos.");
        }
    }, [isAuthenticated]);

    if (loading) return <p>Loading photos...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!photos.length) return <p>No photos found</p>;

    return (
        <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 m-auto">
            <h3>Google Photos</h3>
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
