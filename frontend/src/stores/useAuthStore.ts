import { create } from 'zustand';
import { User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';
import { clearTokens, getAccessToken, setTokens } from '../api/client';
import { authApi } from '../api/auth';

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

let initPromise: Promise<User | null> | null = null;
let hasInitialized = false;

export async function initializeAuth(force = false): Promise<User | null> {
  // If already initialized and not forced, return cached user
  if (hasInitialized && !force) {
    return useAuthStore.getState().user;
  }

  // If a request is already in flight, return the active Promise to deduplicate
  if (initPromise) {
    return initPromise;
  }

  const token = getAccessToken();
  if (!token) {
    hasInitialized = true;
    useAuthStore.getState().setInitializing(false);
    return null;
  }

  initPromise = (async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res?.data) {
        useAuthStore.getState().setUser(res.data);
        hasInitialized = true;
        return res.data;
      }
      return null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        // HTTP 429 Too Many Requests: Rate limited
        // DO NOT log out the user or wipe tokens on 429!
        console.warn('[Auth] Rate limited on /auth/me/ (429). Preserving session.');
      } else if (status === 401) {
        // HTTP 401 Unauthorized: Token is genuinely expired/invalid and refresh failed
        useAuthStore.getState().logout();
      } else {
        // Network or server error - keep token, end loading
        console.warn('[Auth] Initialization network error:', err?.message || err);
      }
      hasInitialized = true;
      return null;
    } finally {
      useAuthStore.getState().setInitializing(false);
      initPromise = null;
    }
  })();

  return initPromise;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  isAuthenticated: !!getAccessToken(),
  isInitializing: !!getAccessToken(),

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
    hasInitialized = true;
    initPromise = null;
    set({ user, isAuthenticated: true, isInitializing: false });
  },

  logout: () => {
    clearTokens();
    hasInitialized = false;
    initPromise = null;
    set({ user: null, isAuthenticated: false, isInitializing: false });
  },

  setInitializing: (isInitializing) => set({ isInitializing }),
}));

