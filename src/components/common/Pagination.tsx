import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, totalElements, pageSize, onChange }) => {
  if (totalPages <= 1) return null;
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {start}–{end} of {totalElements} items
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onChange(page - 1)} disabled={page === 0} style={btnStyle(page === 0)}><ChevronLeft size={15} /></button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
          return (
            <button key={p} onClick={() => onChange(p)} style={btnStyle(false, p === page)}>
              {p + 1}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} style={btnStyle(page >= totalPages - 1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
};

const btnStyle = (disabled: boolean, active = false): React.CSSProperties => ({
  padding: '5px 10px', borderRadius: 6, border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  background: active ? 'var(--accent-glow)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-secondary)',
  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, fontSize: 13,
  display: 'flex', alignItems: 'center', fontFamily: 'var(--font-sans)',
});