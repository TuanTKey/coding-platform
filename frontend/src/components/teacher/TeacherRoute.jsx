import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';

const TeacherRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher' && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default TeacherRoute;
