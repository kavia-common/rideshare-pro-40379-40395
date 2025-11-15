import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import History from './pages/History';
import { useAuth } from './state/authContext';

// PUBLIC_INTERFACE
export default function RoutesConfig() {
  /** Defines public and protected app routes. */
  const { isAuthenticated } = useAuth();

  const Protected = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={
        <Protected>
          <Home />
        </Protected>
      } />
      <Route path="/profile" element={
        <Protected>
          <Profile />
        </Protected>
      } />
      <Route path="/history" element={
        <Protected>
          <History />
        </Protected>
      } />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
