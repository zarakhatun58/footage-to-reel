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
      const userData = { email, username, profilePic };

      // ✅ Save token + user in localStorage + context
      login(token, userData);

      // ✅ Clean URL (remove query params but don’t break history)
      window.history.replaceState({}, document.title, "/");

      // ✅ Redirect
      navigate("/gallery");
    } else {
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
