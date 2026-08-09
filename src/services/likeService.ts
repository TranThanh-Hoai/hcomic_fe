import { apiClient } from './apiClient';
import type { ComicLikeResponse } from '../types';

export const likeService = {
  toggleLike: async (comicId: number): Promise<ComicLikeResponse> => {
    const response = await apiClient.post<ComicLikeResponse>(`/api/comics/${comicId}/toggle-like`);
    return response.data;
  },

  getLikeStatus: async (comicId: number): Promise<ComicLikeResponse | null> => {
    try {
      const response = await apiClient.get<ComicLikeResponse>(`/api/comics/${comicId}/like/status`);
      return response.data;
    } catch {
      return null;
    }
  },
};
