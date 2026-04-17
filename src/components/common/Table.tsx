import React from 'react';

export interface Column<T> {
  key: string;
  title: string;
  render?: (record: T) => React.ReactNode;
  width?: number | string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey: (record: T) => string;
  onRowClick?: (record: T) => void;
  emptyText?: string;
}

export function Table<T>({ columns, data, loading, rowKey, onRowClick, emptyText = 'No data' }: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', width: col.width }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '14px 16px' }}>
                    <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', width: '60%' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
                {emptyText}
              </td>
            </tr>
          ) : data.map(record => (
            <tr
              key={rowKey(record)}
              onClick={() => onRowClick?.(record)}
              style={{
                borderBottom: '1px solid var(--border)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)' }}>
                  {col.render ? col.render(record) : String((record as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}