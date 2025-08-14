import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@/services/apis';

const GoogleLoginButton = ({ onClose }: { onClose: () => void }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Google credentialResponse:", credentialResponse);

    if (!credentialResponse?.credential) {
      alert("Google login failed: No credential returned");
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await api.post('/api/auth/googleLogin', {
        token: credentialResponse.credential,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        alert("Google login failed: Missing user info");
        return;
      }

      const normalizedUser = {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token,
      };

      localStorage.setItem("authToken", token);
      setUser(normalizedUser);

      alert(`✅ Google login successful! Welcome ${user.username || user.email}`);
      onClose();
      navigate("/");
    } catch (err: any) {
      console.error("Google login failed:", err);
      alert(err.response?.data?.error || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleError = () => {
    console.error("Google Sign-In failed");
    alert("Google Sign-In failed");
  };

  return (
    <div className="w-full flex justify-center mt-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
      {googleLoading && <span className="ml-2">Loading...</span>}
    </div>
  );
};

export default GoogleLoginButton;
