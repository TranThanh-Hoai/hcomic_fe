import { apiClient } from './apiClient';
import type { ShelfStatus, UserComicLibraryResponse } from '../types';

export const libraryService = {
  updateLibraryStatus: async (comicId: number, status: ShelfStatus | null): Promise<UserComicLibraryResponse | null> => {
    const response = await apiClient.post<UserComicLibraryResponse | null>('/api/library/status', {
      comicId,
      status,
    });
    return response.data;
  },

  getUserLibrary: async (status?: ShelfStatus): Promise<UserComicLibraryResponse[]> => {
    const response = await apiClient.get<UserComicLibraryResponse[]>('/api/library', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  getComicLibraryStatus: async (comicId: number): Promise<UserComicLibraryResponse | null> => {
    try {
      const response = await apiClient.get<UserComicLibraryResponse>(`/api/library/${comicId}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
