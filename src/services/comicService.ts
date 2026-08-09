import { apiClient } from './apiClient';
import type { ComicResponse, ComicRequestData } from '../types';

export const comicService = {
  getAllComics: async (): Promise<ComicResponse[]> => {
    const response = await apiClient.get<ComicResponse[]>('/api/comics');
    return response.data;
  },

  getComicById: async (id: number): Promise<ComicResponse> => {
    const response = await apiClient.get<ComicResponse>(`/api/comics/${id}`);
    return response.data;
  },

  getComicBySlug: async (slug: string): Promise<ComicResponse> => {
    const response = await apiClient.get<ComicResponse>(`/api/comics/slug/${slug}`);
    return response.data;
  },

  getMyComics: async (): Promise<ComicResponse[]> => {
    const response = await apiClient.get<ComicResponse[]>('/api/comics/my-comics');
    return response.data;
  },

  getComicsByUploader: async (uploader: string): Promise<ComicResponse[]> => {
    const response = await apiClient.get<ComicResponse[]>(`/api/comics/uploader/${uploader}`);
    return response.data;
  },

  createComic: async (data: ComicRequestData, coverFile?: File | null): Promise<ComicResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);

    if (coverFile) {
      formData.append('cover', coverFile);
    }

    const response = await apiClient.post<ComicResponse>('/api/comics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateComic: async (id: number, data: ComicRequestData, coverFile?: File | null): Promise<ComicResponse> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('request', jsonBlob);

    if (coverFile) {
      formData.append('cover', coverFile);
    }

    const response = await apiClient.put<ComicResponse>(`/api/comics/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteComic: async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/comics/${id}`);
    return response.data;
  },
};
