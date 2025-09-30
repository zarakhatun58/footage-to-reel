// ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a loader or blank screen while checking auth
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to homepage or login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child route(s)
  return <Outlet />;
};

export default ProtectedRoute;
