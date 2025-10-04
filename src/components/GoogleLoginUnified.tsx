import React from "react";
import googleIcon from "../assets/google-icon.png";

const GOOGLE_CLIENT_ID =
  "495282347288-bj7l1q7f0c5kbk23623sppibg1tml4dp.apps.googleusercontent.com";

// ✅ Use your frontend URL, not backend, for redirect
// Google will call backend automatically using that code
const REDIRECT_URI = "https://footage-flow-server.onrender.com/api/auth/google/callback";

export const GoogleLoginUnified = ({ onClose }: { onClose?: () => void }) => {
  const handleLogin = () => {
    // ✅ Include Photos scope and ensure proper URL encoding
    const scope = encodeURIComponent(
      "openid profile email https://www.googleapis.com/auth/photoslibrary.readonly"
    );

    // ✅ Build correct Google OAuth2 URL
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true`;

    // ✅ Redirect user to Google sign-in
    window.location.href = url;
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-teal-300 hover:text-white border border-teal-300 transition flex flex-row items-center justify-center gap-2 w-full"
    >
      <img
        src={googleIcon}
        alt="Google icon"
        className="w-5 h-5"
      />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginUnified;
