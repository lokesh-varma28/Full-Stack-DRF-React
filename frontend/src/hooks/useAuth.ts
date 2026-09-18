import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authApi } from '../api/auth';
import { getAccessToken } from '../api/client';

export function useAuth() {
  const { user, isAuthenticated, isInitializing, setUser, setAuth, logout, setInitializing } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getAccessToken();
      if (!token) {
        if (isMounted) setInitializing(false);
        return;
      }

      try {
        const res = await authApi.getCurrentUser();
        if (isMounted && res.data) {
          setUser(res.data);
        }
      } catch {
        // Token invalid/expired and refresh failed
        if (isMounted) logout();
      } finally {
        if (isMounted) setInitializing(false);
      }
    }

    initAuth();

    // Listen for logout events dispatched by Axios interceptor
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [logout, setInitializing, setUser]);

  return {
    user,
    isAuthenticated,
    isInitializing,
    isStaff: !!user?.is_staff,
    setAuth,
    logout,
  };
}
