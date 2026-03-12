import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../lib/constants';

const AuthContext = createContext(null);

const TOKEN_KEY = 'vouch_token';

/**
 * AuthProvider — manages JWT token, user object, loading state.
 * Wraps the entire app so any component can call useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true while checking stored token

  // Helper — authenticated fetch
  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
      }
      if (res.status === 204) return null;
      return res.json();
    },
    [token],
  );

  // On mount (or token change) — validate stored token by calling /auth/me
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await authFetch('/auth/me');
        if (!cancelled) setUser(me);
      } catch {
        // Token invalid/expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, authFetch]);

  // --- Auth actions ---

  /** Register with email */
  const register = async ({ email, username, display_name, password }) => {
    const data = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, display_name, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  /** Login with email */
  const login = async ({ email, password }) => {
    const data = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  /** Google OAuth — sends credential to backend */
  const loginGoogle = async (credential) => {
    const data = await authFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  /** Instagram OAuth — sends code to backend */
  const loginInstagram = async (code) => {
    const data = await authFetch('/auth/instagram', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  /** Complete onboarding */
  const completeOnboarding = async (selectedCategories) => {
    const data = await authFetch('/users/me/onboarding', {
      method: 'POST',
      body: JSON.stringify({ selected_categories: selectedCategories }),
    });
    setUser(data);
    return data;
  };

  /** Update user profile */
  const updateProfile = async (updates) => {
    const data = await authFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setUser(data);
    return data;
  };

  /** Refresh user data from the server */
  const refreshUser = async () => {
    try {
      const me = await authFetch('/auth/me');
      setUser(me);
      return me;
    } catch {
      return null;
    }
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    loginGoogle,
    loginInstagram,
    completeOnboarding,
    updateProfile,
    refreshUser,
    logout,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth context from any component. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
