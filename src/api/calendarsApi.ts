// Calendars API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Calendar } from '@/types';
import { store } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const calendarsApi = {
  /**
   * Get all calendars for current user
   * TODO: Replace with axios.get('/api/calendars')
   */
  async listCalendars(): Promise<Calendar[]> {
    await delay(300);
    return store.calendars;
  },

  /**
   * Toggle calendar visibility
   * TODO: Replace with axios.patch(`/api/calendars/${calendarId}`, { isVisible })
   */
  async toggleVisibility(calendarId: string, isVisible: boolean): Promise<Calendar> {
    await delay(200);

    const calendar = store.calendars.find((c) => c.id === calendarId);
    if (!calendar) {
      throw new Error('캘린더를 찾을 수 없습니다.');
    }

    calendar.isVisible = isVisible;
    return calendar;
  },

  /**
   * Get calendar by ID
   * TODO: Replace with axios.get(`/api/calendars/${calendarId}`)
   */
  async getCalendar(calendarId: string): Promise<Calendar> {
    await delay(200);

    const calendar = store.calendars.find((c) => c.id === calendarId);
    if (!calendar) {
      throw new Error('캘린더를 찾을 수 없습니다.');
    }

    return calendar;
  },
};
