import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getAuthUser, loginUser, logoutUser, registerUser } from "./utils/auth";
import { setAdminSession } from "./utils/adminAuth";

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, username: string, password: string, phone?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: string, token: string, name?: string, email?: string, profilePic?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getAuthUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getAuthUser());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (username: string, password: string) => {
    const result = await loginUser(username, password);
    if (result.success) {
      setUser(getAuthUser());
      setIsLoginModalOpen(false);
    }
    return result;
  };

  const register = async (name: string, username: string, password: string, phone?: string, email?: string) => {
    const result = await registerUser(name, username, password, phone, email);
    if (result.success) {
      setUser(getAuthUser());
      setIsLoginModalOpen(false);
    }
    return result;
  };

  const loginWithSocial = async (provider: string, token: string, name?: string, email?: string, profilePic?: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token, name, email, profilePic }),
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem("danphe_organic_auth", JSON.stringify(result.user));
        localStorage.setItem("danphe_organic_token", result.token);
        // Link to admin session if user is an admin
        if (result.user.role === 'admin') {
          setAdminSession({
            username: result.user.username,
            role: result.user.role,
            name: result.user.name,
            avatar: result.user.avatar
          });
        }

        setUser(result.user);
        setIsLoginModalOpen(false);
        window.dispatchEvent(new Event('auth-change'));
      }
      return result;
    } catch (err) {
      return { success: false, error: "Social login failed. Please try again." };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoginModalOpen,
      openLoginModal: () => setIsLoginModalOpen(true),
      closeLoginModal: () => setIsLoginModalOpen(false),
      login,
      register,
      loginWithSocial,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default AuthContext;

