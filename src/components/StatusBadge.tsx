import React from 'react';
import type { ComicStatus } from '../types';

interface StatusBadgeProps {
  status: ComicStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ONGOING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'COMPLETED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'PAUSED':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'ONGOING':
        return 'Đang tiến hành';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'PAUSED':
        return 'Tạm ngưng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {getLabel()}
    </span>
  );
};
