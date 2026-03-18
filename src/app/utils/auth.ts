export interface User {
  name: string;
}

const AUTH_KEY = "danphe_organic_auth";

export const getAuthUser = (): User | null => {
  const saved = localStorage.getItem(AUTH_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const loginUser = (name: string) => {
  const user = { name };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('auth-change'));
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('auth-change'));
};

export const isAuthenticated = (): boolean => {
  return getAuthUser() !== null;
};
