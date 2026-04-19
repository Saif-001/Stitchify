import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div className="loading-spinner"/></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) {
    const map = { admin: '/admin', tailor: '/tailor/dashboard', customer: '/customer' };
    return <Navigate to={map[user.role] || '/'} replace />;
  }
  return children;
}
