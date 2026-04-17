import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { LoginReq, LoginRes } from '../types/user.types';

export const authApi = {
  login: async (req: LoginReq): Promise<LoginRes> => {
    const res = await axiosClient.post<ApiResponse<LoginRes>>('/api/auth/login', req);
    return res.data.data!;
  },
  refresh: async (refreshToken: string): Promise<LoginRes> => {
    const res = await axiosClient.post<ApiResponse<LoginRes>>('/api/auth/refresh', null, {
      headers: { 'X-Refresh-Token': refreshToken },
    });
    return res.data.data!;
  },
  logout: async (): Promise<void> => {
    await axiosClient.post('/api/auth/logout');
  },
};