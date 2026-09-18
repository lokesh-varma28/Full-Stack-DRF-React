import { create } from 'zustand';
import { User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';
import { clearTokens, getAccessToken, setTokens } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

const getSavedUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  isAuthenticated: !!getAccessToken(),
  isInitializing: true,

  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    set({ user, isAuthenticated: !!user });
  },

  setAuth: (user, access, refresh) => {
    setTokens(access, refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user, isAuthenticated: true, isInitializing: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },

  setInitializing: (isInitializing) => set({ isInitializing }),
}));
