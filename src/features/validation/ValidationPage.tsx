import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Lock } from 'lucide-react';
import { validationApi } from '../../api/validation.api';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table.tsx';
import { Modal } from '../../components/common/Modal';
import { Badge, ValidationBadge } from '../../components/common/Badge.tsx';
import { Input, Select } from '../../components/common/Input';
import { useToast } from '../../components/common/Toast';
import { usePermission } from '../../hooks/usePermission';
import { formatDateTime, getErrorMessage } from '../../utils/formatters';
import type { ValidationSessionRes, ValidationRecordRes } from '../../types/validation.types';
import type { ValidationRecordStatus } from '../../types/enums';


export const ValidationPage: React.FC = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const perm = usePermission();
  const [selectedSession, setSelectedSession] = useState<ValidationSessionRes | null>(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ValidationRecordRes | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [recordFilter, setRecordFilter] = useState<ValidationRecordStatus | ''>('');
  const [submitStatus, setSubmitStatus] = useState<ValidationRecordStatus>('valid');
  const [submitNote, setSubmitNote] = useState('');

  const { data: sessions, isLoading } = useQuery({ queryKey: ['validation-sessions'], queryFn: validationApi.getSessions });
  const { data: records } = useQuery({
    queryKey: ['validation-records', selectedSession?.id, recordFilter],
    queryFn: () => validationApi.getRecords(selectedSession!.id, recordFilter || undefined),
    enabled: !!selectedSession,
  });

  const openMutation = useMutation({
    mutationFn: () => validationApi.openSession({ year: parseInt(year) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validation-sessions'] }); toast('success', `Session ${year} opened`); setShowOpenModal(false); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => validationApi.closeSession(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validation-sessions'] }); toast('success', 'Session closed'); setSelectedSession(null); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: () => validationApi.submitStatus(selectedRecord!.assetId, { status: submitStatus, notes: submitNote || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['validation-records'] }); toast('success', 'Status submitted'); setShowSubmitModal(false); },
    onError: err => toast('error', getErrorMessage(err)),
  });

  const sessionCols: Column<ValidationSessionRes>[] = [
    { key: 'year', title: 'Year', render: r => <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{r.year}</span>, width: 80 },
    { key: 'status', title: 'Status', render: r => {
      const v: Record<string, string> = { in_progress: 'blue', closed: 'gray', pending: 'amber' };
      return <Badge variant={v[r.status] as never}>{r.status.replace('_', ' ')}</Badge>;
    }, width: 110 },
    { key: 'totalRecords', title: 'Total', width: 70 },
    { key: 'validCount', title: 'Valid', render: r => <span style={{ color: 'var(--green)', fontWeight: 600 }}>{r.validCount}</span>, width: 70 },
    { key: 'invalidCount', title: 'Invalid', render: r => <span style={{ color: 'var(--red)', fontWeight: 600 }}>{r.invalidCount}</span>, width: 70 },
    { key: 'missingCount', title: 'Missing', render: r => <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{r.missingCount}</span>, width: 70 },
    { key: 'pendingCount', title: 'Pending', render: r => <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{r.pendingCount}</span>, width: 70 },
    { key: 'initiatedByName', title: 'Initiated By', render: r => r.initiatedByName ?? '—' },
    { key: 'startedAt', title: 'Started', render: r => formatDateTime(r.startedAt), width: 140 },
  ];

  const recordCols: Column<ValidationRecordRes>[] = [
    { key: 'assetCode', title: 'Code', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{r.assetCode}</span>, width: 120 },
    { key: 'assetName', title: 'Asset' },
    { key: 'departmentName', title: 'Department', render: r => r.departmentName ?? '—', width: 150 },
    { key: 'status', title: 'Status', render: r => <ValidationBadge status={r.status} />, width: 100 },
    { key: 'validatedByName', title: 'Validated By', render: r => r.validatedByName ?? '—', width: 140 },
    { key: 'validatedAt', title: 'When', render: r => formatDateTime(r.validatedAt), width: 140 },
    { key: 'notes', title: 'Notes', render: r => r.notes ?? '—' },
    ...(perm.canSubmitValidation ? [{
      key: 'submit', title: '',
      render: (r: ValidationRecordRes) => (
        <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setSelectedRecord(r); setSubmitStatus(r.status !== 'pending' ? r.status : 'valid'); setSubmitNote(''); setShowSubmitModal(true); }}>
          Update
        </Button>
      ), width: 80,
    }] : []),
  ];

  const statusOptions: { value: ValidationRecordStatus; label: string }[] = [
    { value: 'valid', label: '✓ Valid' },
    { value: 'invalid', label: '✗ Invalid' },
    { value: 'missing', label: '! Missing' },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Validation"
        subtitle="Annual asset validation sessions"
        actions={perm.canManageValidation ? <Button icon={<Plus size={15} />} onClick={() => setShowOpenModal(true)}>Open Session</Button> : undefined}
      />

      <div style={{ display: 'grid', gridTemplateColumns: selectedSession ? '1fr 1.6fr' : '1fr', gap: 20 }}>
        {/* Session list */}
        <div>
          <Table
            columns={sessionCols}
            data={sessions ?? []}
            loading={isLoading}
            rowKey={r => r.id}
            onRowClick={r => setSelectedSession(r)}
            emptyText="No validation sessions"
          />
        </div>

        {/* Records panel */}
        {selectedSession && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Year {selectedSession.year} — Records</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={recordFilter} onChange={e => setRecordFilter(e.target.value as ValidationRecordStatus | '')}
                  style={{ padding: '7px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
                  <option value="">All</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                  <option value="missing">Missing</option>
                  <option value="pending">Pending</option>
                </select>
                {perm.canManageValidation && selectedSession.status === 'in_progress' && (
                  <Button size="sm" variant="danger" icon={<Lock size={13} />} loading={closeMutation.isPending} onClick={() => closeMutation.mutate(selectedSession.id)}>
                    Close Session
                  </Button>
                )}
              </div>
            </div>
            <Table columns={recordCols} data={records ?? []} rowKey={r => r.id} emptyText="No records" />
          </div>
        )}
      </div>

      {/* Open session modal */}
      <Modal open={showOpenModal} onClose={() => setShowOpenModal(false)} title="Open Validation Session"
        footer={<>
          <Button variant="secondary" onClick={() => setShowOpenModal(false)}>Cancel</Button>
          <Button loading={openMutation.isPending} onClick={() => openMutation.mutate()}>Open Session</Button>
        </>}
      >
        <Input label="Year *" type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2099" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          This will create validation records for all active assets automatically.
        </p>
      </Modal>

      {/* Submit status modal */}
      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)} title={`Submit: ${selectedRecord?.assetName}`}
        footer={<>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button loading={submitMutation.isPending} onClick={() => submitMutation.mutate()}>Submit</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select label="Validation Status *" value={submitStatus} onChange={e => setSubmitStatus(e.target.value as ValidationRecordStatus)} options={statusOptions} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes</label>
            <textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)} rows={3} placeholder="Add notes…"
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};