import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    console.log("Frontend Step A: Arrived at /auth/callback");

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const username = params.get("username");
    const profilePic = params.get("profilePic") || "";

    console.log("Frontend Step B: Extracted callback params:", { token, email, username, profilePic });

    if (token && email && username) {
      const normalizedUser = { token, email, username, profilePic };

      console.log("Frontend Step C: Normalized user:", normalizedUser);

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      // Clean URL
      window.history.replaceState({}, document.title, "/");

      console.log("Frontend Step D: Stored user & cleaned URL, navigating to /");
      navigate("/"); // Redirect to home or dashboard
    } else {
      console.warn("Frontend Step B: Missing params → fallback redirect");
      navigate("/");
    }
  }, [navigate, setUser]);

  return <div>Logging in with Google...</div>;
};

export default GoogleAuthCallback;
