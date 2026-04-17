import axiosClient from './axiosClient';
import type { ApiResponse, PageRes } from '../types/api.types';
import type { AssetCreateReq, AssetDetailRes, AssetFilters, AssetRes, AssetTransferReq, AssignmentRes } from '../types/asset.types';
import type { ValidationStatusReq } from '../types/validation.types';

export const assetsApi = {
  getAll: async (filters: AssetFilters = {}): Promise<PageRes<AssetRes>> => {
    const res = await axiosClient.get<ApiResponse<PageRes<AssetRes>>>('/api/assets', { params: filters });
    return res.data.data!;
  },
  getById: async (id: string): Promise<AssetDetailRes> => {
    const res = await axiosClient.get<ApiResponse<AssetDetailRes>>(`/api/assets/${id}`);
    return res.data.data!;
  },
  create: async (req: AssetCreateReq): Promise<string> => {
    const res = await axiosClient.post<ApiResponse<string>>('/api/assets', req);
    return res.data.data!;
  },
  update: async (id: string, req: AssetCreateReq): Promise<void> => {
    await axiosClient.put(`/api/assets/${id}`, req);
  },
  archive: async (id: string): Promise<void> => {
    await axiosClient.put(`/api/assets/${id}/archive`);
  },
  transfer: async (id: string, req: AssetTransferReq): Promise<void> => {
    await axiosClient.post(`/api/assets/${id}/transfer`, req);
  },
  returnAsset: async (id: string): Promise<void> => {
    await axiosClient.put(`/api/assets/${id}/return`);
  },
  getHistory: async (id: string): Promise<AssignmentRes[]> => {
    const res = await axiosClient.get<ApiResponse<AssignmentRes[]>>(`/api/assets/${id}/history`);
    return res.data.data!;
  },
  submitValidation: async (id: string, req: ValidationStatusReq): Promise<void> => {
    await axiosClient.put(`/api/assets/${id}/validation-status`, req);
  },
};