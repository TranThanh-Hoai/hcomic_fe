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
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/30';
      case 'PAUSED':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'CANCELLED':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-900/80 text-zinc-400 border-white/10';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'ONGOING':
        return 'Đang ra';
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
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md shadow-sm tracking-wide ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {getLabel()}
    </span>
  );
};
