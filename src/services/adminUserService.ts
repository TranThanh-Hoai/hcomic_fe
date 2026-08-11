import { apiClient } from './apiClient';
import { AdminUserItem, BanUserPayload, PageResponse, UpdateRolePayload, UserRole } from '../types';

export const adminUserService = {
  getUsers: async (params?: {
    query?: string;
    role?: UserRole;
    isBanned?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUserItem>> => {
    const response = await apiClient.get<PageResponse<AdminUserItem>>('/api/admin/users', {
      params: {
        query: params?.query || undefined,
        role: params?.role || undefined,
        isBanned: params?.isBanned,
        page: params?.page || 0,
        size: params?.size || 15,
      },
    });
    return response.data;
  },

  banUser: async (userId: number, payload: BanUserPayload): Promise<AdminUserItem> => {
    const response = await apiClient.put<AdminUserItem>(`/api/admin/users/${userId}/ban`, payload);
    return response.data;
  },

  unbanUser: async (userId: number): Promise<AdminUserItem> => {
    const response = await apiClient.put<AdminUserItem>(`/api/admin/users/${userId}/unban`);
    return response.data;
  },

  updateRole: async (userId: number, payload: UpdateRolePayload): Promise<AdminUserItem> => {
    const response = await apiClient.put<AdminUserItem>(`/api/admin/users/${userId}/role`, payload);
    return response.data;
  },
};
