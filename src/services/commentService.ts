import { apiClient } from './apiClient';
import type { CommentResponse, PageResponse } from '../types';

export const commentService = {
  getComicComments: async (comicId: number, page = 0, size = 10): Promise<PageResponse<CommentResponse>> => {
    const response = await apiClient.get<PageResponse<CommentResponse>>(`/api/comics/${comicId}/comments`, {
      params: { page, size },
    });
    return response.data;
  },

  createComicComment: async (comicId: number, content: string): Promise<CommentResponse> => {
    const response = await apiClient.post<CommentResponse>(`/api/comics/${comicId}/comments`, { content });
    return response.data;
  },

  getChapterComments: async (chapterId: number, page = 0, size = 10): Promise<PageResponse<CommentResponse>> => {
    const response = await apiClient.get<PageResponse<CommentResponse>>(`/api/chapters/${chapterId}/comments`, {
      params: { page, size },
    });
    return response.data;
  },

  createChapterComment: async (chapterId: number, content: string): Promise<CommentResponse> => {
    const response = await apiClient.post<CommentResponse>(`/api/chapters/${chapterId}/comments`, { content });
    return response.data;
  },

  updateComment: async (commentId: number, content: string): Promise<CommentResponse> => {
    const response = await apiClient.put<CommentResponse>(`/api/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/comments/${commentId}`);
    return response.data;
  },
};
