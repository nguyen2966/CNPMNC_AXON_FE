import type { AssetCategory, AssetStatus } from './enums.ts';

export interface AssetRes {
  id: string; assetCode: string; name: string; description: string | null;
  category: AssetCategory; status: AssetStatus;
  purchasePrice: number | null; purchaseDate: string | null;
  departmentId: string | null; departmentName: string | null; createdAt: string;
}
export interface AssetDetailRes extends AssetRes {
  createdById: string | null; createdByName: string | null;
  archivedAt: string | null; updatedAt: string;
}
export interface AssignmentRes {
  id: string; assetId: string; assetCode: string; assetName: string;
  departmentId: string; departmentName: string;
  assignedById: string | null; assignedByName: string | null;
  assignedAt: string; returnedAt: string | null; notes: string | null;
}
export interface AssetCreateReq {
  name: string; description?: string; category: AssetCategory; status: AssetStatus;
  purchasePrice?: number; purchaseDate?: string; departmentId?: string;
}
export interface AssetTransferReq { newDepartmentId: string; notes?: string; }
export interface AssetFilters {
  departmentId?: string; status?: AssetStatus; category?: AssetCategory;
  search?: string; page?: number; size?: number;
}