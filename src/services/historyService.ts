import { apiClient } from './apiClient';
import type { ReadingHistoryRequest, ReadingHistoryResponse } from '../types';

export const historyService = {
  saveOrUpdateProgress: async (data: ReadingHistoryRequest): Promise<ReadingHistoryResponse> => {
    const response = await apiClient.post<ReadingHistoryResponse>('/api/history', data);
    return response.data;
  },

  getUserHistory: async (): Promise<ReadingHistoryResponse[]> => {
    const response = await apiClient.get<ReadingHistoryResponse[]>('/api/history');
    return response.data;
  },

  getProgressByComicId: async (comicId: number): Promise<ReadingHistoryResponse | null> => {
    try {
      const response = await apiClient.get<ReadingHistoryResponse>(`/api/history/${comicId}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
