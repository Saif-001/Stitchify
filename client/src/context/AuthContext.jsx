import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// 🔍 DEBUG TOOL: This will print the URL your live site is using in the browser console (F12)
console.log("Stitchify API Base URL:", process.env.REACT_APP_API_URL || 'http://localhost:5000');

export const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000' 
});

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('stitch_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stitch_token');
    if (!token) { setLoading(false); return; }
    API.get('/api/auth/me')
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('stitch_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, role) => {
    const { data } = await API.post('/api/auth/login', { email, password, role });
    localStorage.setItem('stitch_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const registerCustomer = async (form) => {
    const { data } = await API.post('/api/auth/register/customer', form);
    localStorage.setItem('stitch_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const registerTailor = async (form) => {
    const { data } = await API.post('/api/auth/register/tailor', form);
    localStorage.setItem('stitch_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => { localStorage.removeItem('stitch_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerCustomer, registerTailor, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};