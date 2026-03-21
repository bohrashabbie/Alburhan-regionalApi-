import { apiClient, ApiResult } from './api';

export type User = {
  id: number;
  username: string;
  email: string;
  fullname?: string;
  role?: string;
  isactive?: boolean;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullname?: string;
  role?: string;
};

export type LoginData = {
  username: string;
  password: string;
};

export const authService = {
  async login(data: LoginData): Promise<ApiResult<LoginResponse>> {
    const result = await apiClient.post<LoginResponse>('/auth/login', data);
    if (result.success && result.result?.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.result.access_token);
        localStorage.setItem('user', JSON.stringify(result.result.user));
      }
    }
    return result;
  },

  async register(data: RegisterData): Promise<ApiResult<User>> {
    return apiClient.post<User>('/auth/register', data);
  },

  async getCurrentUser(): Promise<ApiResult<User>> {
    return apiClient.get<User>('/auth/me');
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
