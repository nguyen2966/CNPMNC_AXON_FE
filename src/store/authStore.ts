import { create } from 'zustand';
import type { UserInfo } from '../types/user.types';
import { tokenUtils } from '../utils/token';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setAuth: (user: UserInfo, access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!tokenUtils.getAccessToken(),
  setAuth: (user, access, refresh) => {
    tokenUtils.setTokens(access, refresh);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    tokenUtils.clear();
    set({ user: null, isAuthenticated: false });
  },
}));