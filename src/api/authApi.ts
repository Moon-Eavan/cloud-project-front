// Authentication API
// Supports both Mock and Real backend API based on environment variable

import apiClient from './client';
import type { User, LoginCredentials, SignupData, AuthResponse } from '@/types';

// Mock store (for development when backend is not available)
const mockUsers: User[] = [];
let mockCurrentUser: User | null = null;

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

// Check if we should use mock API
const useMockAPI = import.meta.env.VITE_USE_MOCK_API === 'true';

// Simulated network delay for mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const mockApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(500);

    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    mockCurrentUser = user;
    const token = `mock-token-${user.id}`;

    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));

    return { user, token };
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    await delay(500);

    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      googleConnected: false,
    };

    mockUsers.push(newUser);
    mockCurrentUser = newUser;
    const token = `mock-token-${newUser.id}`;

    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(newUser));

    return { user: newUser, token };
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    const userData = localStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData);
    }
    return mockCurrentUser;
  },

  async logout(): Promise<void> {
    await delay(200);
    mockCurrentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    await delay(300);

    if (!mockCurrentUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    mockCurrentUser = { ...mockCurrentUser, ...updates };

    const userIndex = mockUsers.findIndex(u => u.id === mockCurrentUser!.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = mockCurrentUser;
    }

    localStorage.setItem('user_data', JSON.stringify(mockCurrentUser));

    return mockCurrentUser;
  },

  async changePassword(_currentPassword: string, newPassword: string): Promise<void> {
    await delay(300);
    // Mock implementation - just validate format
    if (newPassword.length < 8) {
      throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    // In mock mode, always succeed (currentPassword is ignored in mock)
  },
};

// Real API functions
const realApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/v1/auth/signin', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;

      // Backend returns accessToken, not token
      const token = data.accessToken || data.token;

      // Create user object from backend response
      const user: User = {
        id: data.cognitoSub || data.user?.id || '',
        name: data.name || data.user?.name || '',
        email: data.email || data.user?.email || credentials.email,
        googleConnected: data.user?.googleConnected || false,
        profileImage: data.user?.profileImage,
        ecampusToken: data.user?.ecampusToken,
      };

      // Store token and user data in localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return { user, token, ...data };
    } catch (error: any) {
      console.error('[authApi.login] 에러 발생:', error);
      console.error('[authApi.login] error.response:', error.response);

      let message = '로그인에 실패했습니다.';

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        // 사용자 친화적인 메시지로 변환
        if (backendMessage.includes('User does not exist')) {
          message = '존재하지 않는 이메일입니다.';
        } else if (backendMessage.includes('Incorrect username or password')) {
          message = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else {
          message = backendMessage;
        }
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      console.error('[authApi.login] 최종 에러 메시지:', message);
      throw new Error(message);
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/v1/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const responseData = response.data;

      // Backend returns accessToken, not token
      const token = responseData.accessToken || responseData.token;

      // Create user object from backend response
      const user: User = {
        id: responseData.cognitoSub || responseData.user?.id || '',
        name: responseData.name || responseData.user?.name || data.name,
        email: responseData.email || responseData.user?.email || data.email,
        googleConnected: responseData.user?.googleConnected || false,
        profileImage: responseData.user?.profileImage,
        ecampusToken: responseData.user?.ecampusToken,
      };

      // Store token and user data in localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return { user, token, ...responseData };
    } catch (error: any) {
      console.error('[authApi.signup] 에러 발생:', error);
      console.error('[authApi.signup] error.response:', error.response);

      let message = '회원가입에 실패했습니다.';

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        // 사용자 친화적인 메시지로 변환
        if (backendMessage.includes('already exists') || backendMessage.includes('이미 존재')) {
          message = '이미 가입된 이메일입니다.';
        } else {
          message = backendMessage;
        }
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      console.error('[authApi.signup] 최종 에러 메시지:', message);
      throw new Error(message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }

      const response = await apiClient.get<User>('/v1/users/me');

      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      // If token is invalid, clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<User>('/v1/users/profile', updates);

      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || '프로필 업데이트에 실패했습니다.';
      throw new Error(message);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/v1/users/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || '비밀번호 변경에 실패했습니다.';
      throw new Error(message);
    }
  },
};

// Export the appropriate API based on environment
export const authApi = useMockAPI ? mockApi : realApi;

// Log which API is being used
if (useMockAPI) {
  console.log('🔶 Using Mock API for authentication (VITE_USE_MOCK_API=true)');
} else {
  console.log('🟢 Using Real Backend API for authentication');
}
