import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';

const TeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();
  // While auth is initializing, don't redirect — render nothing or a loader.
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher' && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default TeacherRoute;
