// Schedules API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Schedule, Task } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const schedulesApi = {
  /**
   * Get all schedules
   * TODO: Replace with axios.get('/api/schedules')
   */
  async listSchedules(): Promise<Schedule[]> {
    await delay(300);
    return store.schedules;
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
   * TODO: Replace with axios.post('/api/schedules', scheduleData)
   */
  async createSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> {
    await delay(400);

    // Validate that calendar is not E-Campus (read-only)
    const calendar = store.calendars.find((c) => c.id === scheduleData.calendarId);
    if (calendar?.type === 'ecampus') {
      throw new Error('E-Campus 캘린더에는 직접 일정을 추가할 수 없습니다.');
    }

    const newSchedule: Schedule = {
      ...scheduleData,
      id: generateId(),
    };

    store.schedules.push(newSchedule);
    return newSchedule;
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
