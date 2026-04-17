import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '../../api/assets.api';
import { Modal } from '../../components/common/Modal.tsx';
import { Button } from '../../components/common/Button.tsx';
import { Input, Select } from '../../components/common/Input.tsx';
import { useToast } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/formatters';
import type { DepartmentRes } from '../../types/department.types';
import type { AssetDetailRes } from '../../types/asset.types';
import {type AssetCategory,type AssetStatus, CATEGORY_LABELS } from '../../types/enums';

interface Props {
  open: boolean;
  onClose: () => void;
  departments: DepartmentRes[];
  asset?: AssetDetailRes;
}

export const AssetFormModal: React.FC<Props> = ({ open, onClose, departments, asset }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!asset;

  const [form, setForm] = React.useState({
    name: asset?.name ?? '',
    description: asset?.description ?? '',
    category: asset?.category ?? 'electronics' as AssetCategory,
    status: asset?.status ?? 'active' as AssetStatus,
    purchasePrice: asset?.purchasePrice?.toString() ?? '',
    purchaseDate: asset?.purchaseDate ?? '',
    departmentId: asset?.departmentId ?? '',
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        name: asset?.name ?? '', description: asset?.description ?? '',
        category: asset?.category ?? 'electronics', status: asset?.status ?? 'active',
        purchasePrice: asset?.purchasePrice?.toString() ?? '',
        purchaseDate: asset?.purchaseDate ?? '', departmentId: asset?.departmentId ?? '',
      });
    }
  }, [open, asset]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name, description: form.description || undefined,
        category: form.category, status: form.status,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        purchaseDate: form.purchaseDate || undefined,
        departmentId: form.departmentId || undefined,
      };
      return isEdit ? assetsApi.update(asset!.id, payload) : assetsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      toast('success', isEdit ? 'Asset updated' : 'Asset created');
      onClose();
    },
    onError: (err) => toast('error', getErrorMessage(err)),
  });

  const deptOptions = departments.map(d => ({ value: d.id, label: `${d.name} (${d.code})` }));
  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const statusOptions = [
    { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }, { value: 'disposed', label: 'Disposed' },
  ];

  return (
    <Modal
      open={open} onClose={onClose}
      title={isEdit ? 'Edit Asset' : 'Create New Asset'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>{isEdit ? 'Save Changes' : 'Create Asset'}</Button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Asset Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MacBook Pro 14" required />
        <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select label="Category *" value={form.category} onChange={e => set('category', e.target.value)} options={categoryOptions} />
          <Select label="Status *" value={form.status} onChange={e => set('status', e.target.value)} options={statusOptions} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Purchase Price ($)" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0.00" />
          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
        </div>
        <Select label="Department" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} options={deptOptions} placeholder="— Select department —" />
      </div>
    </Modal>
  );
};