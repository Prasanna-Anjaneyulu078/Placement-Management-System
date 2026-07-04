import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useAuth - Custom hook for auth state and actions.
 * Reads token/role from localStorage and provides a logout function.
 */
export default function useAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileImage');
    navigate('/login');
  }, [navigate]);

  return { token, role, userName, userEmail, isAuthenticated, logout };
}
