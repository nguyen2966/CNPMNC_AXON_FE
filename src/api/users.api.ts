import axiosClient from './axiosClient';
import type { ApiResponse, PageRes } from '../types/api.types';
import type { AssignRoleReq, UpdateUserStatusReq, UserRes } from '../types/user.types';
import type { UserRole } from '../types/enums';

interface UserFilters { role?: UserRole; isActive?: boolean; search?: string; page?: number; size?: number; }

export const usersApi = {
  getMe: async (): Promise<UserRes> => {
    const res = await axiosClient.get<ApiResponse<UserRes>>('/api/users/me');
    return res.data.data!;
  },
  getAll: async (filters: UserFilters = {}): Promise<PageRes<UserRes>> => {
    const res = await axiosClient.get<ApiResponse<PageRes<UserRes>>>('/api/users', { params: filters });
    return res.data.data!;
  },
  getById: async (id: string): Promise<UserRes> => {
    const res = await axiosClient.get<ApiResponse<UserRes>>(`/api/users/${id}`);
    return res.data.data!;
  },
  assignRole: async (id: string, req: AssignRoleReq): Promise<void> => {
    await axiosClient.put(`/api/users/${id}/role`, req);
  },
  updateStatus: async (id: string, req: UpdateUserStatusReq): Promise<void> => {
    await axiosClient.put(`/api/users/${id}/status`, req);
  },
};