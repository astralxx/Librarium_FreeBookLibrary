import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Проверка аутентификации...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};
