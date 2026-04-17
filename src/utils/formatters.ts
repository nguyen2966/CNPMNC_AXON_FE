export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
};

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const formatEnum = (value: string | null | undefined): string => {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};