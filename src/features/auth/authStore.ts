import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

const getStoredAuth = (): { user: User | null; token: string | null; isAuthenticated: boolean } => {
  try {
    const token = localStorage.getItem('cap_token') || localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('cap_user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    }
  } catch (e) {
    console.error('Failed to parse cached user', e);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  isInitialized: true,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      const { user, token, isAuthenticated } = getStoredAuth();
      set({ user, token, isAuthenticated, isInitialized: true });

      if (token && isAuthenticated) {
        // Background verify session with backend /auth/me without clearing session on offline/minor error
        try {
          const freshUser = await api.getMe();
          if (freshUser) {
            localStorage.setItem('cap_user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }
        } catch {
          // Keep current active session in offline/dev mode
        }
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (phone: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(phone, pass);
      localStorage.setItem('cap_token', res.token);
      localStorage.setItem('cap_user', JSON.stringify(res.user));
      
      // Clear query cache to fetch fresh data for logged-in user
      queryClient.clear();

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'লগইন করতে সমস্যা হয়েছে',
        isAuthenticated: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('cap_token');
    localStorage.removeItem('cap_user');
    localStorage.removeItem('auth_token');
    queryClient.clear();
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true, error: null });
  },
}));
