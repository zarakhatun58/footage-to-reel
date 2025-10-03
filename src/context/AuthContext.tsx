import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/services/apis";

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
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("authUser");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Restore user from localStorage
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (isMounted) setUser({ ...parsedUser, token: savedToken });
        } catch {
          localStorage.removeItem("authUser");
        }
      }

      // Always verify token & fetch profile
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (isMounted && res.data?.user) {
          const fullUser = { ...res.data.user, token: savedToken };
          setUser(fullUser);
          localStorage.setItem("authUser", JSON.stringify(fullUser));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // --- Handle OAuth redirect (Google Photos callback) ---
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      // Fetch fresh profile with new token
      axios
        .get(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data?.user) {
            const fullUser = { ...res.data.user, token };
            setUser(fullUser);
            localStorage.setItem("authToken", token);
            localStorage.setItem("authUser", JSON.stringify(fullUser));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch profile after callback:", err);
        })
        .finally(() => {
          setLoading(false);
          // ✅ Clean URL (remove ?token=...)
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      return;
    }

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token: string, userData: Partial<User>) => {
    const fullUser = { ...userData, token };
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(fullUser));
    setUser(fullUser);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
