import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const username = params.get("username");
    const profilePic = params.get("profilePic") || "";

    if (token && email && username) {
      // ✅ Save token in context and localStorage
      login(token, { email, username, profilePic });
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", username);
      localStorage.setItem("user_profilePic", profilePic);

      // ✅ Clean URL to remove token and query params
      window.history.replaceState({}, document.title, "/gallery");

      // ✅ Navigate to gallery page
      navigate("/gallery");
    } else {
      // ❌ Fallback if something is missing
      console.warn("[GoogleAuthCallback] Missing token or user info");
      navigate("/"); 
    }
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">Logging you in with Google...</p>
    </div>
  );
};

export default GoogleAuthCallback;
