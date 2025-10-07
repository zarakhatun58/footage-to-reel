import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "@/services/apis";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setError("Missing authentication token. Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Save token in localStorage
        localStorage.setItem("token", token);

        // ✅ Fetch user info from backend using token
        const res = await axios.get(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { email, username, profilePic } = res.data;

        // ✅ Save in context
        login(token, { email, username, profilePic });

        // ✅ Save user info in localStorage
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_name", username);
        localStorage.setItem("user_profilePic", profilePic || "");

        // ✅ Clean URL to remove query params
        window.history.replaceState({}, document.title, "/gallery");

        // ✅ Navigate to gallery
        navigate("/gallery");
      } catch (err: any) {
        console.error("[GoogleAuthCallback] Error fetching user info:", err);
        setError("Failed to log in. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [navigate, login]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Logging you in with Google...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );

  return null;
};

export default GoogleAuthCallback;
