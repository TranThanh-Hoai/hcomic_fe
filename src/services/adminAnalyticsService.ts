import { apiClient } from './apiClient';
import type { AdminOverviewData, TrendingComicItem, UserGrowthDataPoint } from '../types';

export const adminAnalyticsService = {
  getOverview: async (): Promise<AdminOverviewData> => {
    const response = await apiClient.get<AdminOverviewData>('/api/admin/analytics/overview');
    return response.data;
  },

  getTrending: async (period: 'DAY' | 'WEEK' | 'MONTH' = 'WEEK', limit = 10): Promise<TrendingComicItem[]> => {
    const response = await apiClient.get<TrendingComicItem[]>('/api/admin/analytics/trending', {
      params: { period, limit },
    });
    return response.data;
  },

  getUserGrowth: async (days = 30): Promise<UserGrowthDataPoint[]> => {
    const response = await apiClient.get<UserGrowthDataPoint[]>('/api/admin/analytics/user-growth', {
      params: { days },
    });
    return response.data;
  },
};
