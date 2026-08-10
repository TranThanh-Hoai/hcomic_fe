import { apiClient } from './apiClient';
import type { PageBookmarkRequest, PageBookmarkResponse } from '../types';

export const bookmarkService = {
  createOrUpdateBookmark: async (data: PageBookmarkRequest): Promise<PageBookmarkResponse> => {
    const response = await apiClient.post<PageBookmarkResponse>('/api/bookmarks', data);
    return response.data;
  },

  getBookmarks: async (params?: { comicId?: number; chapterId?: number }): Promise<PageBookmarkResponse[]> => {
    const response = await apiClient.get<PageBookmarkResponse[]>('/api/bookmarks', { params });
    return response.data;
  },

  deleteBookmark: async (bookmarkId: number): Promise<void> => {
    await apiClient.delete(`/api/bookmarks/${bookmarkId}`);
  },
};
