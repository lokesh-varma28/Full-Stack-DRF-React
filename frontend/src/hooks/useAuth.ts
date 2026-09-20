import { useAuthStore } from '../stores/useAuthStore';

export function useAuth() {
  const { user, isAuthenticated, isInitializing, setUser, setAuth, logout, setInitializing } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitializing,
    isStaff: !!user?.is_staff,
    setUser,
    setAuth,
    logout,
    setInitializing,
  };
}

