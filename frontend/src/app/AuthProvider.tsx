import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getAuthUser, loginUser, logoutUser, registerUser } from "./utils/auth";

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  const register = async (name: string, username: string, password: string) => {
    const result = await registerUser(name, username, password);
    if (result.success) {
      setUser(getAuthUser());
      setIsLoginModalOpen(false);
    }
    return result;
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
