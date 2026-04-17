export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

export interface PageRes<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  response?: { data?: { message?: string; status?: number } };
  message: string;
}