import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { DashboardStatsRes, DepartmentStatsRes } from '../types/dashboard.types.ts';
import type { ValidationSessionRes } from '../types/validation.types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStatsRes> => {
    const res = await axiosClient.get<ApiResponse<DashboardStatsRes>>('/api/dashboard/stats');
    return res.data.data!;
  },
  getByDepartment: async (): Promise<DepartmentStatsRes[]> => {
    const res = await axiosClient.get<ApiResponse<DepartmentStatsRes[]>>('/api/dashboard/by-department');
    return res.data.data!;
  },
  getValidationProgress: async (): Promise<ValidationSessionRes | null> => {
    const res = await axiosClient.get<ApiResponse<ValidationSessionRes | null>>('/api/dashboard/validation-progress');
    return res.data.data;
  },
};