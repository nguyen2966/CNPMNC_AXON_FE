import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { DepartmentReq, DepartmentRes } from '../types/department.types.ts';

export const departmentsApi = {
  getAll: async (): Promise<DepartmentRes[]> => {
    const res = await axiosClient.get<ApiResponse<DepartmentRes[]>>('/api/departments');
    return res.data.data!;
  },
  getById: async (id: string): Promise<DepartmentRes> => {
    const res = await axiosClient.get<ApiResponse<DepartmentRes>>(`/api/departments/${id}`);
    return res.data.data!;
  },
  create: async (req: DepartmentReq): Promise<DepartmentRes> => {
    const res = await axiosClient.post<ApiResponse<DepartmentRes>>('/api/departments', req);
    return res.data.data!;
  },
  update: async (id: string, req: DepartmentReq): Promise<DepartmentRes> => {
    const res = await axiosClient.put<ApiResponse<DepartmentRes>>(`/api/departments/${id}`, req);
    return res.data.data!;
  },
};