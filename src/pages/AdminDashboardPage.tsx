import React, { useEffect, useState } from 'react';
import { adminAnalyticsService } from '../services/adminAnalyticsService';
import type { AdminOverviewData, TrendingComicItem, UserGrowthDataPoint } from '../types';
import { AnalyticsOverviewCards } from '../components/admin/AnalyticsOverviewCards';
import { TrendingComicsWidget } from '../components/admin/TrendingComicsWidget';
import { UserGrowthChart } from '../components/admin/UserGrowthChart';
import { RotateCcw } from 'lucide-react';

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
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Thống Kê Tổng Quan
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Báo cáo dữ liệu hệ thống, lượt đọc và tương tác người dùng thời gian thực
          </p>
        </div>
        <button
          onClick={() => {
            fetchOverview();
            fetchTrending(trendingPeriod);
            fetchUserGrowth();
          }}
          className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-[#141721] hover:bg-white/5 border border-white/10 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Làm mới</span>
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
