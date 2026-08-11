import { apiClient } from './apiClient';
import type { PageResponse, ReportItem, ReportStatus, ReportType, ResolveReportPayload } from '../types';

export const adminReportService = {
  getReports: async (params?: {
    type?: ReportType;
    status?: ReportStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<ReportItem>> => {
    const response = await apiClient.get<PageResponse<ReportItem>>('/api/admin/reports', {
      params: {
        type: params?.type || undefined,
        status: params?.status || 'PENDING',
        page: params?.page || 0,
        size: params?.size || 15,
      },
    });
    return response.data;
  },

  resolveReport: async (id: number, payload: ResolveReportPayload): Promise<ReportItem> => {
    const response = await apiClient.put<ReportItem>(`/api/admin/reports/${id}/resolve`, payload);
    return response.data;
  },
};
