import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Restoring your session...
      </div>
    );
  }

  // 1. If not logged in at all, kick to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If user doesn't have the correct role for this specific page, kick them to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If they pass the checks, let them view the page
  return children;
};

export default ProtectedRoute;