import { apiClient } from './apiClient';
import type { CreateReportPayload, ReportItem } from '../types';

export const reportService = {
  createReport: async (payload: CreateReportPayload): Promise<ReportItem> => {
    const response = await apiClient.post<ReportItem>('/api/reports', payload);
    return response.data;
  },
};
