import { apiClient } from './apiClient';
import type { CommentResponse } from '../types';

export const commentService = {
  getComicComments: async (comicId: number): Promise<CommentResponse[]> => {
    const response = await apiClient.get<CommentResponse[]>(`/api/comics/${comicId}/comments`);
    return response.data;
  },

  createComicComment: async (comicId: number, content: string): Promise<CommentResponse> => {
    const response = await apiClient.post<CommentResponse>(`/api/comics/${comicId}/comments`, { content });
    return response.data;
  },

  getChapterComments: async (chapterId: number): Promise<CommentResponse[]> => {
    const response = await apiClient.get<CommentResponse[]>(`/api/chapters/${chapterId}/comments`);
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
