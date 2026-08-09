import { apiClient } from './apiClient';
import type { ChapterResponse, ChapterDetailResponse, ChapterRequestData } from '../types';

export const chapterService = {
  createChapter: async (comicId: number, data: ChapterRequestData, imageFiles: File[]): Promise<ChapterResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<ChapterResponse>(`/api/comics/${comicId}/chapters`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getChaptersByComicSlug: async (comicSlug: string, sort: 'asc' | 'desc' = 'desc'): Promise<ChapterResponse[]> => {
    const response = await apiClient.get<ChapterResponse[]>(`/api/comics/slug/${comicSlug}/chapters`, {
      params: { sort },
    });
    return response.data;
  },

  getChaptersByComicId: async (comicId: number, sort: 'asc' | 'desc' = 'desc'): Promise<ChapterResponse[]> => {
    const response = await apiClient.get<ChapterResponse[]>(`/api/comics/${comicId}/chapters`, {
      params: { sort },
    });
    return response.data;
  },

  getChapterDetailBySlug: async (comicSlug: string, chapterSlug: string): Promise<ChapterDetailResponse> => {
    const response = await apiClient.get<ChapterDetailResponse>(`/api/comics/slug/${comicSlug}/chapters/${chapterSlug}`);
    return response.data;
  },

  updateChapter: async (chapterId: number, data: ChapterRequestData, imageFiles?: File[]): Promise<ChapterResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await apiClient.put<ChapterResponse>(`/api/chapters/${chapterId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteChapter: async (chapterId: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/chapters/${chapterId}`);
    return response.data;
  },
};
