import { apiClient, API_BASE_URL } from './apiClient';
import type { AuthResponse, RegisterResponse, UserRole } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  role?: UserRole;
}

export const authService = {
  getGoogleAuthUrl: (): string => {
    return `${API_BASE_URL}/oauth2/authorization/google`;
  },

  login: async (data: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterParams): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken?: string | null): Promise<void> => {
    try {
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Backend logout call completed with response:', e);
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken?: string }>('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getHello: async (): Promise<string> => {
    const response = await apiClient.get<string>('/api/auth/hello');
    return response.data;
  },
};
