import React, { useEffect, useState } from 'react';
import { adminAnalyticsService } from '../services/adminAnalyticsService';
import type { AdminOverviewData, TrendingComicItem, UserGrowthDataPoint } from '../types';
import { AnalyticsOverviewCards } from '../components/admin/AnalyticsOverviewCards';
import { TrendingComicsWidget } from '../components/admin/TrendingComicsWidget';
import { UserGrowthChart } from '../components/admin/UserGrowthChart';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [trendingPeriod, setTrendingPeriod] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [trending, setTrending] = useState<TrendingComicItem[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [userGrowth, setUserGrowth] = useState<UserGrowthDataPoint[]>([]);
  const [loadingGrowth, setLoadingGrowth] = useState(true);

  useEffect(() => {
    fetchOverview();
    fetchUserGrowth();
  }, []);

  useEffect(() => {
    fetchTrending(trendingPeriod);
  }, [trendingPeriod]);

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const data = await adminAnalyticsService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTrending = async (period: 'DAY' | 'WEEK' | 'MONTH') => {
    try {
      setLoadingTrending(true);
      const data = await adminAnalyticsService.getTrending(period, 10);
      setTrending(data);
    } catch (err) {
      console.error('Failed to load trending comics:', err);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      setLoadingGrowth(true);
      const data = await adminAnalyticsService.getUserGrowth(30);
      setUserGrowth(data);
    } catch (err) {
      console.error('Failed to load user growth:', err);
    } finally {
      setLoadingGrowth(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Thống Kê Tổng Quan</h1>
          <p className="text-xs text-slate-500 mt-1">Báo cáo dữ liệu hệ thống, lượt đọc và tương tác người dùng</p>
        </div>
        <button
          onClick={() => {
            fetchOverview();
            fetchTrending(trendingPeriod);
            fetchUserGrowth();
          }}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      <AnalyticsOverviewCards data={overview} loading={loadingOverview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingComicsWidget
          items={trending}
          period={trendingPeriod}
          onPeriodChange={setTrendingPeriod}
          loading={loadingTrending}
        />
        <UserGrowthChart data={userGrowth} loading={loadingGrowth} />
      </div>
    </div>
  );
};
