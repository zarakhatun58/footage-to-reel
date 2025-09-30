import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { BASE_URL } from '@/services/apis';
import React, { useEffect } from 'react';

const GOOGLE_CLIENT_ID = '495282347288-bj7l1q7f0c5kbk23623sppibg1tml4dp.apps.googleusercontent.com';
const REDIRECT_URI = 'https://footage-flow-server.onrender.com/api/auth/google/callback';

export const GoogleLoginUnified = ({ onClose }: { onClose?: () => void }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // 🔹 Redirect to Google OAuth consent page
  const handleLogin = () => {
    const scope = encodeURIComponent(
      'openid profile email https://www.googleapis.com/auth/photoslibrary.readonly'
    );

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    console.log("Frontend Step 1: Redirecting user to Google Auth URL:", url);
    window.location.href = url;
  };

  // 🔹 Handle callback if redirected with `code`
  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    console.log("Frontend Step 2: Checking for Google redirect code:", code);

    if (!code) {
      console.log("Frontend Step 2: No code found in URL → Probably on normal page load");
      return;
    }

    try {
      console.log("Frontend Step 3: Sending code to backend:", code);
      const res = await api.post(`${BASE_URL}/api/auth/googleLogin`, { code });

      console.log("Frontend Step 4: Backend responded:", res.data);

      const { token, user } = res.data;

      const normalizedUser = {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token,
      };

      console.log("Frontend Step 5: Normalized user:", normalizedUser);

      // Store user and token
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      console.log("Frontend Step 6: User stored in context + localStorage");

      if (onClose) onClose();
      navigate('/'); // redirect after login
    } catch (err: any) {
      console.error("Frontend Step X: Google login failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || 'Google login failed');
    }
  };

  // 🔹 Run once on mount
  useEffect(() => {
    console.log("Frontend Step 0: GoogleLoginUnified mounted → checking callback...");
    handleCallback();
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-[#ffffff] text-gray-600 rounded-xl hover:bg-teal-300 border border-teal-300 transition"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLoginUnified;
