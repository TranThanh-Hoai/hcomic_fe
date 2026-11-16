import React from 'react';
import type { AdminOverviewData } from '../../types';
import { BookOpen, Users, ShieldAlert } from 'lucide-react';

interface Props {
  data: AdminOverviewData | null;
  loading: boolean;
}

export const AnalyticsOverviewCards: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#141721] p-5 rounded-2xl border border-white/5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      title: 'Tổng Lượt Đọc',
      value: data.totalReads.toLocaleString(),
      subtitle: `${data.totalComics} bộ truyện trên hệ thống`,
      badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      icon: <BookOpen className="w-5 h-5 text-orange-400" />,
    },
    {
      title: 'Tổng Người Dùng',
      value: data.totalUsers.toLocaleString(),
      subtitle: `+${data.newUsersToday} hôm nay • +${data.newUsersThisWeek} tuần này`,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: <Users className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Báo Cáo Chờ Xử Lý',
      value: data.pendingReportsCount.toLocaleString(),
      subtitle: `${data.bannedUsersCount} tài khoản bị ban`,
      badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/20',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#141721] p-5 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{card.title}</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">{card.value}</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">{card.subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${card.badgeColor} flex items-center justify-center shadow-lg`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
