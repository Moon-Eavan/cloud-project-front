// In-memory storage for mock data
// This will be replaced with real backend API calls later

import type {
  User,
  Calendar,
  Schedule,
  Task,
  Friend,
  FriendRequest,
  Group,
  GroupSchedule,
  Notification,
} from '@/types';
import {
  mockCalendars,
  mockSchedules,
  mockTasks,
  mockFriends,
  mockGroups,
  mockNotifications,
} from './mockData';

// Storage objects
export const store = {
  users: [] as User[],
  calendars: [...mockCalendars],
  schedules: [...mockSchedules],
  tasks: [...mockTasks],
  friends: [...mockFriends],
  friendRequests: [] as FriendRequest[],
  groups: [...mockGroups],
  groupSchedules: [] as GroupSchedule[],
  notifications: [...mockNotifications],
  currentUser: {
    id: 'current-user-id',
    name: '김철수',
    email: 'user@example.com',
    googleConnected: false,
  } as User,
};

// Helper functions for ID generation
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sync currentUser from localStorage
export const syncCurrentUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      store.currentUser = user;
    } catch (error) {
      console.error('Failed to sync current user from localStorage:', error);
    }
  }
};

// Reset function for development/testing
export const resetStore = () => {
  store.users = [];
  store.calendars = [];
  store.schedules = [];
  store.tasks = [];
  store.friends = [];
  store.friendRequests = [];
  store.groups = [];
  store.groupSchedules = [];
  store.notifications = [];
  store.currentUser = null;
};
