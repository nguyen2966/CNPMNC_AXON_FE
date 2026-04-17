import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { OpenSessionReq, ValidationRecordRes, ValidationSessionRes, ValidationStatusReq } from '../types/validation.types';
import type { ValidationRecordStatus } from '../types/enums';

export const validationApi = {
  getSessions: async (): Promise<ValidationSessionRes[]> => {
    const res = await axiosClient.get<ApiResponse<ValidationSessionRes[]>>('/api/validation/sessions');
    return res.data.data!;
  },
  getSessionById: async (id: string): Promise<ValidationSessionRes> => {
    const res = await axiosClient.get<ApiResponse<ValidationSessionRes>>(`/api/validation/sessions/${id}`);
    return res.data.data!;
  },
  openSession: async (req: OpenSessionReq): Promise<ValidationSessionRes> => {
    const res = await axiosClient.post<ApiResponse<ValidationSessionRes>>('/api/validation/sessions', req);
    return res.data.data!;
  },
  closeSession: async (id: string): Promise<void> => {
    await axiosClient.put(`/api/validation/sessions/${id}/close`);
  },
  getRecords: async (sessionId: string, status?: ValidationRecordStatus, departmentId?: string): Promise<ValidationRecordRes[]> => {
    const res = await axiosClient.get<ApiResponse<ValidationRecordRes[]>>(
      `/api/validation/sessions/${sessionId}/records`,
      { params: { status, departmentId } }
    );
    return res.data.data!;
  },
  submitStatus: async (assetId: string, req: ValidationStatusReq): Promise<void> => {
    await axiosClient.put(`/api/validation/assets/${assetId}/status`, req);
  },
};