/// <reference types="vite/client" />

/** Base API URL — reads from .env (VITE_API_URL) or falls back to localhost */
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

/** Generic fetch wrapper with typed responses and consistent error handling */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error?.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
