import { create } from 'zustand';
import type { UserInfo } from '../types/user.types';
import { tokenUtils } from '../utils/token';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: UserInfo | null;
  isInitializing: boolean,
  isAuthenticated: boolean;
  setAuth: (user: UserInfo, access: string, refresh: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  setAuth: (user, access, refresh) => {
    tokenUtils.setTokens(access, refresh);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    tokenUtils.clear();
    set({ user: null, isAuthenticated: false });
  },
  initAuth: async () => {
    const refreshToken = tokenUtils.getRefreshToken();

    if (!refreshToken) {
      set({ isInitializing: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const loginRes = await authApi.refresh(refreshToken);

      const user: UserInfo = {
        id: loginRes.user.id,
        email: loginRes.user.email,
        role: loginRes.user.role,
        fullName: loginRes.user.fullName,
      }

      tokenUtils.setTokens(loginRes.accessToken, loginRes.refreshToken);

      set({ user, isAuthenticated: true, isInitializing: false });
    } catch (error) {
      console.error('Khôi phục phiên đăng nhập thất bại:', error);
      tokenUtils.clear();
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));