import React, { useState } from 'react';
import { useQuery} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { assetsApi } from '../../api/assets.api';
import { departmentsApi } from '../../api/departments.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Table, type Column } from '../../components/common/Table.tsx';
import { Pagination } from '../../components/common/Pagination.tsx';
import { Button } from '../../components/common/Button.tsx';
import { AssetStatusBadge } from '../../components/common/Badge.tsx';
import { AssetFormModal } from './AssetFormModal';
import { usePermission } from '../../hooks/usePermission';
import { formatDate, formatCurrency} from '../../utils/formatters';
import type { AssetRes, AssetFilters } from '../../types/asset.types';
import {type AssetCategory,type AssetStatus, CATEGORY_LABELS } from '../../types/enums';

export const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const { canManageAssets } = usePermission();
  const [filters, setFilters] = useState<AssetFilters>({ page: 0, size: 10 });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetsApi.getAll(filters),
  });
  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const applySearch = () => setFilters(f => ({ ...f, search: search || undefined, page: 0 }));

  const columns: Column<AssetRes>[] = [
    { key: 'assetCode', title: 'Code', render: r => (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>{r.assetCode}</span>
    ), width: 130 },
    { key: 'name', title: 'Name', render: r => (
      <div>
        <div style={{ fontWeight: 500 }}>{r.name}</div>
        {r.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.description.slice(0, 50)}{r.description.length > 50 ? '…' : ''}</div>}
      </div>
    )},
    { key: 'category', title: 'Category', render: r => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{CATEGORY_LABELS[r.category]}</span>, width: 120 },
    { key: 'status', title: 'Status', render: r => <AssetStatusBadge status={r.status} />, width: 110 },
    { key: 'departmentName', title: 'Department', render: r => r.departmentName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>, width: 160 },
    { key: 'purchasePrice', title: 'Value', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(r.purchasePrice)}</span>, width: 110 },
    { key: 'purchaseDate', title: 'Purchase Date', render: r => formatDate(r.purchaseDate), width: 120 },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Assets"
        subtitle={`${data?.totalElements ?? 0} total assets`}
        actions={canManageAssets ? <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>New Asset</Button> : undefined}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applySearch()}
            placeholder="Search by name or code…"
            style={{ width: '100%', padding: '9px 12px 9px 38px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filters.status ?? ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value as AssetStatus || undefined, page: 0 }))}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: filters.status ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
          <option value="disposed">Disposed</option>
        </select>
        <select value={filters.category ?? ''} onChange={e => setFilters(f => ({ ...f, category: e.target.value as AssetCategory || undefined, page: 0 }))}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: filters.category ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filters.departmentId ?? ''} onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value || undefined, page: 0 }))}
          style={{ padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }}>
          <option value="">All Departments</option>
          {depts?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <Button variant="secondary" onClick={applySearch} icon={<Search size={14} />}>Search</Button>
      </div>

      <Table
        columns={columns}
        data={data?.content ?? []}
        loading={isLoading}
        rowKey={r => r.id}
        onRowClick={r => navigate(`/assets/${r.id}`)}
      />
      <Pagination
        page={filters.page ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        pageSize={filters.size ?? 10}
        onChange={p => setFilters(f => ({ ...f, page: p }))}
      />

      <AssetFormModal open={showForm} onClose={() => setShowForm(false)} departments={depts ?? []} />
    </div>
  );
};