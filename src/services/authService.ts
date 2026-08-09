import { apiClient } from './apiClient';
import type { AuthResponse, RegisterResponse, UserRole } from '../types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  role?: UserRole;
}

export const authService = {
  login: async (data: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterParams): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  },

  getHello: async (): Promise<string> => {
    const response = await apiClient.get<string>('/api/auth/hello');
    return response.data;
  },
};
