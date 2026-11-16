import { apiClient } from './apiClient';
import type { ComicResponse, ComicRequestData, PageResponse, ComicFilterParams } from '../types';

export const comicService = {
  getAllComics: async (
    filterOrPage: ComicFilterParams | number = 0,
    size = 20,
    genre?: string
  ): Promise<PageResponse<ComicResponse>> => {
    const params: Record<string, any> = {};

    if (typeof filterOrPage === 'number') {
      params.page = filterOrPage;
      params.size = size;
      if (genre && genre !== 'ALL') {
        params.genre = genre;
      }
    } else {
      const {
        page = 0,
        size: pageSize = 20,
        query,
        q,
        genre: g,
        genres,
        status,
        uploader,
        sortBy,
        sortDir = 'desc',
      } = filterOrPage;

      params.page = page;
      params.size = pageSize;

      const searchKeyword = query || q;
      if (searchKeyword && searchKeyword.trim()) {
        params.query = searchKeyword.trim();
      }

      if (g && g !== 'ALL') {
        params.genre = g.trim();
      }

      if (genres && genres.length > 0) {
        params.genres = genres.join(',');
      }

      if (status && status !== 'ALL') {
        params.status = status;
      }

      if (uploader && uploader.trim()) {
        params.uploader = uploader.trim();
      }

      if (sortBy) {
        let sortField = 'createdAt';
        if (sortBy === 'views') sortField = 'viewCount';
        else if (sortBy === 'rating') sortField = 'rating';
        else if (sortBy === 'title') sortField = 'title';
        params.sort = `${sortField},${sortDir}`;
      }
    }

    const response = await apiClient.get<PageResponse<ComicResponse>>('/api/comics', {
      params,
    });
    return response.data;
  },

  quickSearch: async (query: string, limit = 5): Promise<ComicResponse[]> => {
    if (!query || !query.trim()) return [];
    const response = await apiClient.get<ComicResponse[]>('/api/comics/quick-search', {
      params: { query: query.trim(), limit },
    });
    return response.data || [];
  },

  getComicById: async (id: number): Promise<ComicResponse> => {
    const response = await apiClient.get<ComicResponse>(`/api/comics/${id}`);
    return response.data;
  },

  getComicBySlug: async (slug: string): Promise<ComicResponse> => {
    const response = await apiClient.get<ComicResponse>(`/api/comics/slug/${slug}`);
    return response.data;
  },

  getMyComics: async (page = 0, size = 20): Promise<PageResponse<ComicResponse>> => {
    const response = await apiClient.get<PageResponse<ComicResponse>>('/api/comics/my-comics', {
      params: { page, size },
    });
    return response.data;
  },

  getComicsByUploader: async (uploader: string, page = 0, size = 20): Promise<PageResponse<ComicResponse>> => {
    const response = await apiClient.get<PageResponse<ComicResponse>>(`/api/comics/uploader/${uploader}`, {
      params: { page, size },
    });
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
