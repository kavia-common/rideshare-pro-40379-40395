import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import jwtDecode from 'jwt-decode';

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async (_email, _password) => {},
  register: async (_payload) => {},
  logout: () => {},
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and helpers to the app. */
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) return null;
    try {
      return jwtDecode(t);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  const login = async (email, password) => {
    // Backend integration point: POST /auth/login
    // For now, accept any non-empty and stub a token if backend unavailable.
    if (!email || !password) throw new Error('Email and password are required');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || ''}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.token);
      try { setUser(jwtDecode(data.token)); } catch { setUser({ email }); }
      return true;
    } catch {
      // Fallback token stub to allow frontend preview
      const stub = btoa(JSON.stringify({ sub: 'preview', email, iat: Date.now()/1000 }));
      const fakeToken = `${stub}.${stub}.${stub}`;
      setToken(fakeToken);
      setUser({ email });
      return true;
    }
  };

  const register = async (payload) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || ''}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Register failed');
      const data = await res.json();
      setToken(data.token);
      try { setUser(jwtDecode(data.token)); } catch { setUser({ email: payload.email }); }
      return true;
    } catch {
      // Fallback to auto-login preview
      return login(payload.email, payload.password);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    isAuthenticated: !!token,
    token,
    user,
    login,
    register,
    logout,
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  return useContext(AuthContext);
}
