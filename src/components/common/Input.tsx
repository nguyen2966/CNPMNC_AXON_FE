import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
          {icon}
        </span>
      )}
      <input
        style={{
          width: '100%', padding: icon ? '9px 12px 9px 38px' : '9px 12px',
          background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14,
          outline: 'none', transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => (e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-focus)')}
        onBlur={e => (e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)')}
        {...props}
      />
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, placeholder, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
    <select
      style={{
        width: '100%', padding: '9px 12px',
        background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 14,
        outline: 'none', appearance: 'none', cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
  </div>
);