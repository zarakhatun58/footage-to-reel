import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const username = params.get("username");
    const profilePic = params.get("profilePic") || "";

    if (token && email && username) {
      const normalizedUser = { token, email, username, profilePic };
      localStorage.setItem("authToken", token);  // ✅ store JWT token
      localStorage.setItem("authUser", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      // Clean URL
      window.history.replaceState({}, document.title, "/");

      navigate("/gallery"); // ✅ redirect to gallery after login
    } else {
      navigate("/"); // fallback
    }
  }, [navigate, setUser]);

  return <div>Logging in with Google...</div>;
};

export default GoogleAuthCallback;
