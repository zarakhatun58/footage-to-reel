import React from "react";

const GOOGLE_CLIENT_ID = "495282347288-bj7l1q7f0c5kbk23623sppibg1tml4dp.apps.googleusercontent.com";
const REDIRECT_URI = "https://footage-flow-server.onrender.com/api/auth/google/callback";

export const GoogleLoginUnified = ({ onClose }: { onClose?: () => void }) => {
  const handleLogin = () => {
    const scope = encodeURIComponent(
      "openid profile email https://www.googleapis.com/auth/photoslibrary.readonly"
    );

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true`;

    window.location.href = url;
  };
  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-teal-300 border border-teal-300 transition"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLoginUnified;
