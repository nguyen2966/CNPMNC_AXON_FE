import type { UserRole } from './enums.ts';

export interface UserInfo { id: string; email: string; fullName: string; role: UserRole; }
export interface LoginRes { accessToken: string; refreshToken: string; user: UserInfo; }
export interface UserRes {
  id: string; email: string; fullName: string; role: UserRole | null;
  departmentId: string | null; departmentName: string | null;
  isActive: boolean; createdAt: string;
}
export interface LoginReq { email: string; password: string; }
export interface AssignRoleReq { role: UserRole; }
export interface UpdateUserStatusReq { isActive: boolean; }
export interface UpdateDepartmentReq { departmentId: string | null; }
export interface CreateUserReq {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  departmentId?: string;
}