export interface DashboardStatsRes {
  totalAssets: number; activeAssets: number; inactiveAssets: number;
  archivedAssets: number; disposedAssets: number;
  validationValid: number; validationInvalid: number;
  validationMissing: number; validationPending: number;
}
export interface DepartmentStatsRes {
  departmentId: string; departmentName: string; assetCount: number; totalValue: number;
}