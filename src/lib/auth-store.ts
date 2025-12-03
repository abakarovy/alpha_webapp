import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type UserProfile } from './api';

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, data?: {
    business_type?: string;
    full_name?: string;
    nickname?: string;
    phone?: string;
    country?: string;
    gender?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const profile = await authApi.getProfile(response.user.id);
          
          set({
            user: profile,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, data = {}) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({
            email,
            password,
            ...data,
          });
          const profile = await authApi.getProfile(response.user.id);
          
          set({
            user: profile,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          const response = await authApi.checkToken(token);
          if (response.valid && get().user) {
            set({ isAuthenticated: true });
            return true;
          } else {
            set({ isAuthenticated: false, token: null, user: null });
            return false;
          }
        } catch {
          set({ isAuthenticated: false, token: null, user: null });
          return false;
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        const { token, user } = get();
        if (!token || !user) {
          throw new Error('Not authenticated');
        }

        try {
          const updated = await authApi.updateProfile(token, data);
          set({ user: updated });
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

