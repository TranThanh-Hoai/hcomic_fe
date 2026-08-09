import { apiClient } from './apiClient';
import type { ComicRateResponse } from '../types';

export const rateService = {
  rateComic: async (comicId: number, score: number): Promise<ComicRateResponse> => {
    const response = await apiClient.post<ComicRateResponse>('/api/ratings', { comicId, rating: score });
    return response.data;
  },

  getAverageRating: async (comicId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/api/ratings/comic/${comicId}/average`);
    return response.data;
  },

  getUserRating: async (comicId: number): Promise<ComicRateResponse | null> => {
    try {
      const response = await apiClient.get<ComicRateResponse>(`/api/ratings/comic/${comicId}/user`);
      return response.data;
    } catch {
      return null;
    }
  },
};
