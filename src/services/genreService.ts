import { apiClient } from './apiClient';
import type { GenreResponse, GenreRequestData } from '../types';

export const genreService = {
  getAllGenres: async (): Promise<GenreResponse[]> => {
    const response = await apiClient.get<GenreResponse[]>('/api/genres');
    return response.data;
  },

  getGenreBySlug: async (slug: string): Promise<GenreResponse> => {
    const response = await apiClient.get<GenreResponse>(`/api/genres/${slug}`);
    return response.data;
  },

  createGenre: async (data: GenreRequestData): Promise<GenreResponse> => {
    const response = await apiClient.post<GenreResponse>('/api/genres', data);
    return response.data;
  },

  updateGenre: async (id: number, data: GenreRequestData): Promise<GenreResponse> => {
    const response = await apiClient.put<GenreResponse>(`/api/genres/${id}`, data);
    return response.data;
  },

  deleteGenre: async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/genres/${id}`);
    return response.data;
  },
};
