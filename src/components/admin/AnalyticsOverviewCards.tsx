import React from 'react';
import type { AdminOverviewData } from '../../types';

interface Props {
  data: AdminOverviewData | null;
  loading: boolean;
}

export const AnalyticsOverviewCards: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse h-28"></div>
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
      color: 'from-blue-500 to-indigo-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Tổng Người Dùng',
      value: data.totalUsers.toLocaleString(),
      subtitle: `+${data.newUsersToday} hôm nay • +${data.newUsersThisWeek} tuần này`,
      color: 'from-emerald-500 to-teal-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Báo Cáo Chờ Xử Lý',
      value: data.pendingReportsCount.toLocaleString(),
      subtitle: `${data.bannedUsersCount} tài khoản bị ban`,
      color: 'from-rose-500 to-red-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{card.subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
