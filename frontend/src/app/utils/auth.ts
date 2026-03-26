/// <reference types="vite/client" />
export interface User {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  role: 'user' | 'admin' | 'delivery';
  avatar?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_KEY = "danphe_organic_auth";

export const getAuthUser = (): User | null => {
  const saved = localStorage.getItem(AUTH_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const registerUser = async (name: string, username: string, password: string, phone?: string, email?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, phone, email }),
    });
    const result = await response.json();
    if (result.success) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return result;
  } catch (err) {
    return { success: false, error: "Network error. Please check if backend is running." };
  }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (result.success) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return result;
  } catch (err) {
    return { success: false, error: "Network error. Please check if backend is running." };
  }
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('auth-change'));
};

export const isAuthenticated = (): boolean => {
  return getAuthUser() !== null;
};
