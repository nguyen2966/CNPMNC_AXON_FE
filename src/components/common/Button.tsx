import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
  secondary: { background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  danger:    { background: 'rgba(240,82,82,0.1)', color: 'var(--red)', border: '1px solid rgba(240,82,82,0.3)' },
  ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '4px 12px', fontSize: 12, gap: 5 },
  md: { padding: '7px 16px', fontSize: 13, gap: 6 },
  lg: { padding: '10px 22px', fontSize: 14, gap: 8 },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, icon, children, disabled, style, ...props
}) => (
  <button
    disabled={disabled || loading}
    style={{
      ...styles[variant],
      ...sizes[size],
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--radius-sm)', fontWeight: 500,
      fontFamily: 'var(--font-sans)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: 'all 0.15s ease',
      ...style,
    }}
    {...props}
  >
    {loading ? (
      <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
    ) : icon}
    {children}
  </button>
);