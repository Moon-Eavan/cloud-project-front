// Tasks API - Backend Integration
import apiClient from './client';
import { stripHtml } from '@/lib/htmlUtils';
import type { Task, TaskStatus } from '@/types';

// Backend TodoResponse type
interface TodoResponse {
  todoId: number;
  cognitoSub: string;
  parentTodoId: number | null;
  scheduleId: number | null;
  categoryId: number | null;
  groupId: number | null;
  title: string;
  description: string | null;
  startDate: string; // ISO 8601 date (YYYY-MM-DD)
  dueDate: string; // ISO 8601 date (YYYY-MM-DD)
  deadline: string | null; // ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  progressPercentage: number;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Convert backend status to frontend status
const mapBackendStatusToFrontend = (backendStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'): TaskStatus => {
  const statusMap: Record<'TODO' | 'IN_PROGRESS' | 'DONE', TaskStatus> = {
    TODO: 'todo',
    IN_PROGRESS: 'progress',
    DONE: 'done',
  };
  return statusMap[backendStatus];
};

// Convert frontend status to backend status
const mapFrontendStatusToBackend = (frontendStatus: TaskStatus): 'TODO' | 'IN_PROGRESS' | 'DONE' => {
  const statusMap: Record<TaskStatus, 'TODO' | 'IN_PROGRESS' | 'DONE'> = {
    todo: 'TODO',
    progress: 'IN_PROGRESS',
    done: 'DONE',
  };
  return statusMap[frontendStatus];
};

// Format Date object to YYYY-MM-DD
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse YYYY-MM-DD string to Date object
const parseDateString = (dateStr: string): Date => {
  return new Date(dateStr);
};

// Convert backend TodoResponse to frontend Task type
const mapTodoResponseToTask = (response: TodoResponse): Task => {
  return {
    id: response.todoId.toString(),
    title: response.title,
    description: response.description || '',
    startDate: parseDateString(response.startDate),
    endDate: parseDateString(response.dueDate),
    status: mapBackendStatusToFrontend(response.status),
    parentTaskId: response.parentTodoId ? response.parentTodoId.toString() : null,
    scheduleId: response.scheduleId ? response.scheduleId.toString() : undefined,
    deadline: response.deadline ? new Date(response.deadline) : undefined,
  };
};

export const tasksApi = {
  /**
   * Get all tasks
   */
  async listTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get<TodoResponse[]>('/v1/todos');
      return response.data.map(mapTodoResponseToTask);
    } catch (error) {
      console.error('[tasksApi.listTasks] Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Create task from Kanban board
   * Kanban can only create parent tasks
   */
  async createTaskFromKanban(taskData: Omit<Task, 'id' | 'parentTaskId'>): Promise<Task> {
    try {
      // Get default category ID from user's first category
      const categoriesResponse = await apiClient.get('/v1/categories');
      console.log('[tasksApi] Categories response:', categoriesResponse.data);

      if (!categoriesResponse.data || categoriesResponse.data.length === 0) {
        throw new Error('카테고리가 없습니다. 먼저 카테고리를 생성해주세요.');
      }

      const defaultCategoryId = categoriesResponse.data[0].categoryId;
      console.log('[tasksApi] Using categoryId:', defaultCategoryId);

      // Format deadline if provided (date only, time set to 23:59:59)
      const formatDeadline = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T23:59:59`;
      };

      const requestBody: any = {
        title: taskData.title,
        description: taskData.description || null,
        startDate: formatDateToString(taskData.startDate),
        dueDate: formatDateToString(taskData.endDate),
        status: 'TODO', // New tasks start in TODO status
        categoryId: defaultCategoryId,
        scheduleId: null,
        priority: 'MEDIUM', // Default priority
      };

      // Add deadline if provided
      if (taskData.deadline) {
        requestBody.deadline = formatDeadline(taskData.deadline);
      }

      console.log('[tasksApi] Request body:', requestBody);
      const response = await apiClient.post<TodoResponse>('/v1/todos', requestBody);
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.createTaskFromKanban] Error creating task:', error);
      throw error;
    }
  },

  /**
   * Create task from Gantt chart
   * Can create both parent tasks and subtasks
   */
  async createTaskFromGantt(taskData: Omit<Task, 'id'>): Promise<Task> {
    try {
      // If it's a subtask, use the subtask creation endpoint
      if (taskData.parentTaskId) {
        return await this.createSubtask(taskData.parentTaskId, taskData);
      }

      // Get default category ID from user's first category
      const categoriesResponse = await apiClient.get('/v1/categories');
      console.log('[tasksApi] Categories response:', categoriesResponse.data);

      if (!categoriesResponse.data || categoriesResponse.data.length === 0) {
        throw new Error('카테고리가 없습니다. 먼저 카테고리를 생성해주세요.');
      }

      const defaultCategoryId = categoriesResponse.data[0].categoryId;
      console.log('[tasksApi] Using categoryId:', defaultCategoryId);

      // Format deadline if provided (date only, time set to 23:59:59)
      const formatDeadline = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T23:59:59`;
      };

      // Otherwise, create a parent task
      const requestBody: any = {
        title: taskData.title,
        description: taskData.description || null,
        startDate: formatDateToString(taskData.startDate),
        dueDate: formatDateToString(taskData.endDate),
        status: mapFrontendStatusToBackend(taskData.status),
        categoryId: defaultCategoryId,
        scheduleId: null,
        priority: 'MEDIUM', // Default priority
      };

      // Add deadline if provided
      if (taskData.deadline) {
        requestBody.deadline = formatDeadline(taskData.deadline);
      }

      console.log('[tasksApi] Request body:', requestBody);
      const response = await apiClient.post<TodoResponse>('/v1/todos', requestBody);
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.createTaskFromGantt] Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    try {
      const backendStatus = mapFrontendStatusToBackend(newStatus);
      const response = await apiClient.patch<TodoResponse>(`/v1/todos/${taskId}/status`, {
        status: backendStatus,
      });
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.updateTaskStatus] Error updating task status:', error);
      throw error;
    }
  },

  /**
   * Update task details
   * Backend requires full TodoRequest object via PUT
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      // First, fetch the current task to get all fields
      const currentTaskResponse = await apiClient.get<TodoResponse>(`/v1/todos/${taskId}`);
      const currentTask = currentTaskResponse.data;

      // Format deadline if provided (date only, time set to 23:59:59)
      const formatDeadline = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T23:59:59`;
      };

      // Merge updates with current task data
      const requestBody: any = {
        title: updates.title !== undefined ? updates.title : currentTask.title,
        description: updates.description !== undefined ? (updates.description || null) : currentTask.description,
        startDate: updates.startDate !== undefined ? formatDateToString(updates.startDate) : currentTask.startDate,
        dueDate: updates.endDate !== undefined ? formatDateToString(updates.endDate) : currentTask.dueDate,
        categoryId: currentTask.categoryId,
        scheduleId: currentTask.scheduleId,
        priority: currentTask.priority || 'MEDIUM',
        groupId: currentTask.groupId,
      };

      // Handle deadline updates
      if (updates.deadline !== undefined) {
        requestBody.deadline = updates.deadline ? formatDeadline(updates.deadline) : null;
      } else {
        requestBody.deadline = currentTask.deadline;
      }

      console.log('[tasksApi.updateTask] Request body:', requestBody);
      const response = await apiClient.put<TodoResponse>(`/v1/todos/${taskId}`, requestBody);
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.updateTask] Error updating task:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   * If deleting a parent task, backend should also delete all subtasks
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/todos/${taskId}`);
    } catch (error) {
      console.error('[tasksApi.deleteTask] Error deleting task:', error);
      throw error;
    }
  },

  /**
   * Create subtask for a parent task (Gantt only)
   */
  async createSubtask(
    parentTaskId: string,
    subtaskData: Omit<Task, 'id' | 'parentTaskId'>
  ): Promise<Task> {
    try {
      // Get default category ID from user's first category
      const categoriesResponse = await apiClient.get('/v1/categories');
      console.log('[tasksApi.createSubtask] Categories response:', categoriesResponse.data);

      if (!categoriesResponse.data || categoriesResponse.data.length === 0) {
        throw new Error('카테고리가 없습니다. 먼저 카테고리를 생성해주세요.');
      }

      const defaultCategoryId = categoriesResponse.data[0].categoryId;
      console.log('[tasksApi.createSubtask] Using categoryId:', defaultCategoryId);

      // Format deadline if provided (date only, time set to 23:59:59)
      const formatDeadline = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T23:59:59`;
      };

      const requestBody: any = {
        title: subtaskData.title,
        description: subtaskData.description || null,
        startDate: formatDateToString(subtaskData.startDate),
        dueDate: formatDateToString(subtaskData.endDate),
        categoryId: defaultCategoryId,
        scheduleId: null,
        priority: 'MEDIUM', // Default priority
      };

      // Add deadline if provided
      if (subtaskData.deadline) {
        requestBody.deadline = formatDeadline(subtaskData.deadline);
      }

      console.log('[tasksApi.createSubtask] Request body:', requestBody);
      const response = await apiClient.post<TodoResponse>(
        `/v1/todos/${parentTaskId}/subtasks`,
        requestBody
      );
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.createSubtask] Error creating subtask:', error);
      throw error;
    }
  },

  /**
   * Create TODO from schedule
   * Sets scheduleId to link with the schedule, and deadline to schedule's end date
   */
  async createTaskFromSchedule(schedule: { id: string; title: string; description?: string; start: Date; end: Date; calendarId: string }): Promise<Task> {
    try {
      // Format deadline as ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)
      const formatDeadline = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const requestBody = {
        title: schedule.title,
        description: schedule.description ? stripHtml(schedule.description) : null,
        startDate: formatDateToString(new Date()), // Start today
        dueDate: formatDateToString(schedule.end), // Due date = schedule end date
        deadline: formatDeadline(schedule.end), // Deadline = schedule end datetime
        status: 'TODO',
        categoryId: parseInt(schedule.calendarId),
        scheduleId: parseInt(schedule.id), // Link to schedule
        priority: 'MEDIUM',
      };

      console.log('[tasksApi.createTaskFromSchedule] Request body:', requestBody);
      const response = await apiClient.post<TodoResponse>('/v1/todos', requestBody);
      return mapTodoResponseToTask(response.data);
    } catch (error) {
      console.error('[tasksApi.createTaskFromSchedule] Error creating task from schedule:', error);
      throw error;
    }
  },
};
