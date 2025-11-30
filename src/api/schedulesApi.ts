// Schedules API
import apiClient from './client';
import type { Schedule, Task } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend ScheduleResponse type
interface ScheduleResponse {
  scheduleId: number;
  cognitoSub: string;
  groupId: number | null;
  categoryId: number;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  isAllDay: boolean;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  recurrenceRule: string | null;
  source: 'USER' | 'CANVAS' | 'GOOGLE';
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Convert backend ScheduleResponse to frontend Schedule type
const mapScheduleResponseToSchedule = (response: ScheduleResponse): Schedule => {
  // Parse backend LocalDateTime as local time (not UTC)
  // Backend sends: "2025-12-02T20:00:00" or "2025-12-02 20:00:00"
  // We treat it as local time (KST), not UTC
  const parseLocalDateTime = (dateTimeStr: string): Date => {
    if (!dateTimeStr) {
      return new Date();
    }

    // Parse the datetime string as-is from backend
    // Backend will send the correct local time after fixing LocalDateTime serialization
    return new Date(dateTimeStr);
  };

  return {
    id: response.scheduleId.toString(),
    title: response.title,
    description: response.description || '',
    start: parseLocalDateTime(response.startTime),
    end: parseLocalDateTime(response.endTime),
    location: response.location || undefined,
    isCompleted: response.status === 'DONE',
    calendarId: response.categoryId.toString(),
  };
};

export const schedulesApi = {
  /**
   * Get all schedules
   */
  async listSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get<ScheduleResponse[]>('/v1/schedules');
      return response.data.map(mapScheduleResponseToSchedule);
    } catch (error) {
      console.error('[schedulesApi.listSchedules] Error fetching schedules:', error);
      throw error;
    }
  },

  /**
   * Get schedules for a specific calendar
   * TODO: Replace with axios.get(`/api/schedules?calendarId=${calendarId}`)
   */
  async getSchedulesByCalendar(calendarId: string): Promise<Schedule[]> {
    await delay(300);
    return store.schedules.filter((s) => s.calendarId === calendarId);
  },

  /**
   * Create a new schedule
   */
  async createSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> {
    try {
      // Helper function to format date as local time (not UTC)
      const formatLocalDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      // Convert frontend Schedule to backend ScheduleRequest format
      const requestBody = {
        title: scheduleData.title,
        description: scheduleData.description || null,
        location: scheduleData.location || null,
        startTime: formatLocalDateTime(scheduleData.start), // Local time, not UTC
        endTime: formatLocalDateTime(scheduleData.end),
        isAllDay: false,
        categoryId: parseInt(scheduleData.calendarId),
        groupId: null,
        recurrenceRule: null,
      };

      const response = await apiClient.post<ScheduleResponse>('/v1/schedules', requestBody);
      return mapScheduleResponseToSchedule(response.data);
    } catch (error) {
      console.error('[schedulesApi.createSchedule] Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Update an existing schedule
   * TODO: Replace with axios.patch(`/api/schedules/${scheduleId}`, updates)
   */
  async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> {
    await delay(400);

    const scheduleIndex = store.schedules.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex === -1) {
      throw new Error('일정을 찾을 수 없습니다.');
    }

    // Check if schedule belongs to E-Campus (read-only)
    const schedule = store.schedules[scheduleIndex];
    const calendar = store.calendars.find((c) => c.id === schedule.calendarId);
    if (calendar?.type === 'ecampus') {
      throw new Error('E-Campus 캘린더의 일정은 수정할 수 없습니다.');
    }

    store.schedules[scheduleIndex] = { ...store.schedules[scheduleIndex], ...updates };
    return store.schedules[scheduleIndex];
  },

  /**
   * Delete a schedule
   * TODO: Replace with axios.delete(`/api/schedules/${scheduleId}`)
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    await delay(300);

    const scheduleIndex = store.schedules.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex === -1) {
      throw new Error('일정을 찾을 수 없습니다.');
    }

    // Check if schedule belongs to E-Campus (read-only)
    const schedule = store.schedules[scheduleIndex];
    const calendar = store.calendars.find((c) => c.id === schedule.calendarId);
    if (calendar?.type === 'ecampus') {
      throw new Error('E-Campus 캘린더의 일정은 삭제할 수 없습니다.');
    }

    store.schedules.splice(scheduleIndex, 1);
  },

  /**
   * Convert schedule to task (spec.md section 4.2)
   * Creates a parent task with startDate=today, endDate=schedule.end
   * TODO: Replace with axios.post('/api/schedules/${scheduleId}/convert-to-task')
   */
  async convertToTask(scheduleId: string): Promise<Task> {
    await delay(400);

    const schedule = store.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new Error('일정을 찾을 수 없습니다.');
    }

    const newTask: Task = {
      id: generateId(),
      title: schedule.title,
      description: schedule.description,
      startDate: new Date(), // Today
      endDate: schedule.end,
      status: 'todo',
      parentTaskId: null, // Always creates parent task
    };

    store.tasks.push(newTask);
    return newTask;
  },

  /**
   * Mark schedule as completed/incomplete
   * TODO: Replace with axios.patch(`/api/schedules/${scheduleId}/complete`, { isCompleted })
   */
  async toggleComplete(scheduleId: string, isCompleted: boolean): Promise<Schedule> {
    await delay(300);

    const scheduleIndex = store.schedules.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex === -1) {
      throw new Error('일정을 찾을 수 없습니다.');
    }

    store.schedules[scheduleIndex].isCompleted = isCompleted;
    return store.schedules[scheduleIndex];
  },
};
