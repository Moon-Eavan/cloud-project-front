// Authentication API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { User, LoginCredentials, SignupData, AuthResponse } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  /**
   * Login with email and password
   * TODO: Replace with axios.post('/api/auth/login', credentials)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(500);

    const user = store.users.find(
      (u) => u.email === credentials.email
    );

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // In real implementation, verify password hash
    // For mock, we'll just accept any password

    store.currentUser = user;

    return {
      user,
      token: `mock-token-${user.id}`,
    };
  },

  /**
   * Sign up a new user
   * TODO: Replace with axios.post('/api/auth/signup', data)
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    await delay(500);

    // Check if email already exists
    const existingUser = store.users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // Create new user
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      googleConnected: false,
    };

    store.users.push(newUser);
    store.currentUser = newUser;

    return {
      user: newUser,
      token: `mock-token-${newUser.id}`,
    };
  },

  /**
   * Get current authenticated user
   * TODO: Replace with axios.get('/api/auth/me')
   */
  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    return store.currentUser;
  },

  /**
   * Logout current user
   * TODO: Replace with axios.post('/api/auth/logout')
   */
  async logout(): Promise<void> {
    await delay(200);
    store.currentUser = null;
  },

  /**
   * Update user profile
   * TODO: Replace with axios.patch('/api/auth/profile', updates)
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(300);

    const userIndex = store.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    store.users[userIndex] = { ...store.users[userIndex], ...updates };

    if (store.currentUser && store.currentUser.id === userId) {
      store.currentUser = store.users[userIndex];
    }

    return store.users[userIndex];
  },
};
