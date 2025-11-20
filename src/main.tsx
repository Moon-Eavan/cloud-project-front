import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize mock data
import { store } from './mocks/mockStore';
import {
  mockUser,
  mockCalendars,
  mockSchedules,
  mockTasks,
  mockFriends,
  mockGroups,
  mockNotifications,
} from './mocks/mockData';

// Populate store with mock data
store.users.push(mockUser);
store.calendars.push(...mockCalendars);
store.schedules.push(...mockSchedules);
store.tasks.push(...mockTasks);
store.friends.push(...mockFriends);
store.groups.push(...mockGroups);
store.notifications.push(...mockNotifications);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
