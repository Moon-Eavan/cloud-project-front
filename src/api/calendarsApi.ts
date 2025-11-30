// Calendars API
import apiClient from './client';
import type { Calendar, CalendarType } from '@/types';
import { store } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend CategoryResponse type
interface CategoryResponse {
  categoryId: number;
  cognitoSub: string;
  groupId: number | null;
  name: string;
  color: string;
  icon: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Convert backend CategoryResponse to frontend Calendar type
const mapCategoryResponseToCalendar = (response: CategoryResponse): Calendar => {
  // Determine calendar type based on category name
  let type: CalendarType = 'local';
  if (response.name === 'Canvas') {
    type = 'ecampus';
  } else if (response.name.includes('Google')) {
    type = 'google';
  }

  return {
    id: response.categoryId.toString(),
    name: response.name,
    type: type,
    color: response.color,
    isVisible: true, // Default to visible
  };
};

export const calendarsApi = {
  /**
   * Get all calendars for current user
   */
  async listCalendars(): Promise<Calendar[]> {
    try {
      const response = await apiClient.get<CategoryResponse[]>('/v1/categories');
      return response.data.map(mapCategoryResponseToCalendar);
    } catch (error) {
      console.error('[calendarsApi.listCalendars] Error fetching calendars:', error);
      throw error;
    }
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

  /**
   * Create a new calendar
   */
  async createCalendar(data: { name: string; color: string; icon?: string; groupId?: number }): Promise<Calendar> {
    try {
      const requestBody = {
        name: data.name,
        color: data.color,
        icon: data.icon || null,
        groupId: data.groupId || null,
      };

      const response = await apiClient.post<CategoryResponse>('/v1/categories', requestBody);
      return mapCategoryResponseToCalendar(response.data);
    } catch (error) {
      console.error('[calendarsApi.createCalendar] Error creating calendar:', error);
      throw error;
    }
  },
};
