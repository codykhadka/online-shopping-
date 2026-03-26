// Utility for admin session stored in localStorage

const ADMIN_KEY = 'danphe_admin_session';

export interface AdminSession {
  username: string;
  role: string;
  name?: string;
  avatar?: string;
}

export function setAdminSession(admin: AdminSession) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  return session !== null && session.username === 'Cody';
}
