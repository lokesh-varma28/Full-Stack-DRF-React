import React, { useEffect } from 'react';
import { initializeAuth, useAuthStore } from '../stores/useAuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    // Single authoritative auth initialization on app mount
    initializeAuth();

    // Central listener for logout events dispatched by Axios interceptor
    const handleLogoutEvent = () => {
      useAuthStore.getState().logout();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  return <>{children}</>;
};
