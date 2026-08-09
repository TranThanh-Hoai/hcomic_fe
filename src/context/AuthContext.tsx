import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole, AuthResponse, RegisterResponse } from '../types';
import { authService } from '../services/authService';
import type { LoginParams, RegisterParams } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginParams) => Promise<AuthResponse>;
  register: (data: RegisterParams) => Promise<RegisterResponse>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('hcomic_token');
    const savedUser = localStorage.getItem('hcomic_user');

    if (savedToken && savedUser && savedToken !== 'undefined' && savedToken !== 'null') {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('hcomic_token');
        localStorage.removeItem('hcomic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginParams): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    const authToken = response.accessToken || response.token || '';
    const userRole = response.userRole || response.role || 'USER';

    const userObj: User = {
      username: response.username,
      displayName: response.displayName || response.username,
      email: response.email,
      avatar: response.avatar,
      role: userRole,
    };
    
    setToken(authToken);
    setUser(userObj);
    localStorage.setItem('hcomic_token', authToken);
    localStorage.setItem('hcomic_user', JSON.stringify(userObj));
    
    return response;
  };

  const register = async (data: RegisterParams): Promise<RegisterResponse> => {
    return await authService.register(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hcomic_token');
    localStorage.removeItem('hcomic_user');
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
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
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
