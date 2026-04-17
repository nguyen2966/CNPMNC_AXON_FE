import axiosClient from './axiosClient';
import type { ApiResponse, PageRes } from '../types/api.types';
import type { AuditLogFilters, AuditLogRes } from '../types/auditlog.types';

export const auditLogsApi = {
  getAll: async (filters: AuditLogFilters = {}): Promise<PageRes<AuditLogRes>> => {
    const res = await axiosClient.get<ApiResponse<PageRes<AuditLogRes>>>('/api/audit-logs', { params: filters });
    return res.data.data!;
  },
  getByAsset: async (assetId: string): Promise<AuditLogRes[]> => {
    const res = await axiosClient.get<ApiResponse<AuditLogRes[]>>(`/api/audit-logs/assets/${assetId}`);
    return res.data.data!;
  },
};