import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, AuthResponse, RegisterResponse } from '../types';
import { authService, type LoginParams, type RegisterParams } from '../services/authService';
import { parseJwt } from '../utils/jwtHelper';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginParams) => Promise<AuthResponse>;
  register: (data: RegisterParams) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  setSession: (token: string, refreshToken: string, customUser?: Partial<User>) => void;
  hasRole: (roles: UserRole[]) => boolean;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    const currentRefresh = localStorage.getItem('hcomic_refresh_token');
    try {
      await authService.logout(currentRefresh);
    } catch {
      // Ignored
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('hcomic_token');
      localStorage.removeItem('hcomic_refresh_token');
      localStorage.removeItem('hcomic_user');
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('hcomic_token');
    const savedRefreshToken = localStorage.getItem('hcomic_refresh_token');
    const savedUser = localStorage.getItem('hcomic_user');

    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      try {
        setToken(savedToken);
        setRefreshToken(savedRefreshToken || null);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Attempt to decode from JWT
          const payload = parseJwt(savedToken);
          if (payload) {
            const role = (payload.role || payload.userRole || (payload.roles && payload.roles[0]) || 'USER') as UserRole;
            const userObj: User = {
              username: payload.sub || payload.username || 'User',
              displayName: payload.displayName || payload.sub || 'User',
              email: payload.email,
              role,
            };
            setUser(userObj);
            localStorage.setItem('hcomic_user', JSON.stringify(userObj));
          }
        }
      } catch {
        localStorage.removeItem('hcomic_token');
        localStorage.removeItem('hcomic_refresh_token');
        localStorage.removeItem('hcomic_user');
      }
    }

    // Listen for unauthorized events emitted by apiClient
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    setIsLoading(false);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const setSession = (newToken: string, newRefreshToken: string, customUser?: Partial<User>) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('hcomic_token', newToken);
    localStorage.setItem('hcomic_refresh_token', newRefreshToken);

    let userObj: User;
    if (customUser && customUser.username) {
      userObj = {
        username: customUser.username,
        displayName: customUser.displayName || customUser.username,
        email: customUser.email,
        avatar: customUser.avatar,
        role: customUser.role || 'USER',
        isBanned: customUser.isBanned,
      };
    } else {
      const payload = parseJwt(newToken);
      const role = (payload?.role || payload?.userRole || (payload?.roles && payload?.roles[0]) || 'USER') as UserRole;
      userObj = {
        username: payload?.sub || payload?.username || 'User',
        displayName: payload?.displayName || payload?.sub || 'User',
        email: payload?.email,
        role,
      };
    }

    setUser(userObj);
    localStorage.setItem('hcomic_user', JSON.stringify(userObj));
  };

  const login = async (credentials: LoginParams): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    const authToken = response.accessToken || response.token || '';
    const authRefreshToken = response.refreshToken || '';
    const userRole = (response.userRole || response.role || 'USER') as UserRole;

    const userObj: User = {
      username: response.username,
      displayName: response.displayName || response.username,
      email: response.email,
      avatar: response.avatar,
      role: userRole,
    };

    setToken(authToken);
    setRefreshToken(authRefreshToken);
    setUser(userObj);
    localStorage.setItem('hcomic_token', authToken);
    if (authRefreshToken) {
      localStorage.setItem('hcomic_refresh_token', authRefreshToken);
    }
    localStorage.setItem('hcomic_user', JSON.stringify(userObj));

    return response;
  };

  const register = async (data: RegisterParams): Promise<RegisterResponse> => {
    return await authService.register(data);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('hcomic_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        setSession,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
