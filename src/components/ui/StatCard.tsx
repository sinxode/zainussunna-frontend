import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  return (
    <div className="zcm-stat-card">
      <div className="zcm-stat-card__header">
        <span>{title}</span>
        <div className={`zcm-stat-card__icon zcm-stat-card__icon--${variant}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="zcm-stat-card__value">{value}</div>
      {subtitle && <div className="zcm-stat-card__sub">{subtitle}</div>}
    </div>
  );
};
