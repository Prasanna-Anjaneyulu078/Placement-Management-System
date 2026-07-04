import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute - Route guard that checks authentication and role.
 *
 * Props:
 *   children  - The component to render if authorized
 *   role      - Required role: 'STUDENT' | 'ALUMNI' | 'ADMIN'
 *               If omitted, only checks for a valid token (any role).
 */
export default function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
