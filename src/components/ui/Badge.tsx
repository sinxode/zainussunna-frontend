import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
  title?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  title,
}) => {
  return (
    <span className={`zcm-badge zcm-badge--${variant} ${className}`} title={title}>
      {children}
    </span>
  );
};
