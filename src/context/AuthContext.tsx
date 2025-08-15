import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/services/apis';

type User = {
  id?: string;
  email?: string;
  username?: string;
  profilePic?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, userData: Partial<User>) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Optimistically set user with token, then validate with API
      if (isMounted) setUser({ token: savedToken });

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          withCredentials: true,
        });

        if (isMounted) {
          setUser({ ...res.data.user, token: savedToken });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Only remove token if definitely invalid (optional)
        // localStorage.removeItem('authToken');
        if (isMounted) setUser(null); // fallback to logged-out state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token: string, userData: Partial<User>) => {
    localStorage.setItem('authToken', token);
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
