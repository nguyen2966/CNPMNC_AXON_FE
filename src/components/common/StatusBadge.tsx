import React from 'react';

type Variant = 'green' | 'red' | 'amber' | 'purple' | 'teal' | 'blue' | 'gray';

const variantStyles: Record<Variant, React.CSSProperties> = {
  green:  { background: 'rgba(46,197,138,0.12)', color: '#2ec58a', border: '1px solid rgba(46,197,138,0.25)' },
  red:    { background: 'rgba(240,82,82,0.12)',  color: '#f05252', border: '1px solid rgba(240,82,82,0.25)' },
  amber:  { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' },
  purple: { background: 'rgba(167,139,250,0.12)',color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' },
  teal:   { background: 'rgba(20,184,166,0.12)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)' },
  blue:   { background: 'rgba(79,122,255,0.12)', color: '#4f7aff', border: '1px solid rgba(79,122,255,0.25)' },
  gray:   { background: 'rgba(122,128,153,0.12)',color: '#7a8099', border: '1px solid rgba(122,128,153,0.25)' },
};

interface BadgeProps { variant?: Variant; children: React.ReactNode; }

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children }) => (
  <span style={{
    ...variantStyles[variant],
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500, letterSpacing: 0.3,
    whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

import type { AssetStatus, ValidationRecordStatus, UserRole } from '../../types/enums.ts';

export const AssetStatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const map: Record<AssetStatus, { variant: Variant; label: string }> = {
    active:   { variant: 'green',  label: 'Active' },
    inactive: { variant: 'amber',  label: 'Inactive' },
    archived: { variant: 'gray',   label: 'Archived' },
    disposed: { variant: 'red',    label: 'Disposed' },
  };
  const { variant, label } = map[status] ?? { variant: 'gray', label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

export const ValidationBadge: React.FC<{ status: ValidationRecordStatus }> = ({ status }) => {
  const map: Record<ValidationRecordStatus, { variant: Variant; label: string }> = {
    valid:   { variant: 'green',  label: 'Valid' },
    invalid: { variant: 'red',    label: 'Invalid' },
    missing: { variant: 'amber',  label: 'Missing' },
    pending: { variant: 'gray',   label: 'Pending' },
  };
  const { variant, label } = map[status] ?? { variant: 'gray', label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

export const RoleBadge: React.FC<{ role: UserRole | null }> = ({ role }) => {
  if (!role) return <Badge variant="gray">No Role</Badge>;
  const map: Record<UserRole, { variant: Variant; label: string }> = {
    admin:            { variant: 'purple', label: 'Admin' },
    asset_manager:    { variant: 'blue',   label: 'Asset Manager' },
    department_staff: { variant: 'teal',   label: 'Staff' },
    auditor:          { variant: 'amber',  label: 'Auditor' },
  };
  const { variant, label } = map[role];
  return <Badge variant={variant}>{label}</Badge>;
};