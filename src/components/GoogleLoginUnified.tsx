import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@/services/apis';
import React, { useEffect } from 'react';

const GOOGLE_CLIENT_ID = '495282347288-bj7l1q7f0c5kbk23623sppibg1tml4dp.apps.googleusercontent.com';
const REDIRECT_URI = 'https://footage-flow-server.onrender.com/api/auth/google/callback';

export const GoogleLoginUnified = ({ onClose }: { onClose?: () => void }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to Google OAuth consent page
  const handleLogin = () => {
    const scope = encodeURIComponent(
      'openid profile email https://www.googleapis.com/auth/photoslibrary.readonly'
    );

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    console.log("Redirecting to Google:", url);
    window.location.href = url;
  };

  // Handle callback if redirected with code
  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    console.log("Google code found:", code);

    try {
      const res = await api.post('/api/auth/googleLogin', { code });
      console.log("Backend response:", res.data);

      const { token, user } = res.data;

      const normalizedUser = {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token,
      };

      // Store user and token
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      if (onClose) onClose();
      navigate('/'); // redirect after login
    } catch (err: any) {
      console.error("Google login failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || 'Google login failed');
    }
  };

  // Run once on mount
  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLoginUnified;
