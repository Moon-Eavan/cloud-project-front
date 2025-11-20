// Tasks API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Task, TaskStatus } from '@/types';
import { store, generateId } from '@/mocks/mockStore';
import { syncGanttToKanban, syncKanbanToGantt, updateTaskStatus } from '@/lib/syncRules';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const tasksApi = {
  /**
   * Get all tasks
   * TODO: Replace with axios.get('/api/tasks')
   */
  async listTasks(): Promise<Task[]> {
    await delay(300);
    return store.tasks;
  },

  /**
   * Create task from Kanban board (spec 3.2)
   * Kanban can only create parent tasks
   * Task is also created in Gantt
   * TODO: Replace with axios.post('/api/tasks/kanban', taskData)
   */
  async createTaskFromKanban(taskData: Omit<Task, 'id' | 'parentTaskId'>): Promise<Task> {
    await delay(400);

    const newTask: Task = {
      ...taskData,
      id: generateId(),
      parentTaskId: null, // Kanban always creates parent tasks
      status: 'todo', // New tasks start in todo
    };

    // Sync to Gantt (parent task without subtasks)
    const ganttTask = syncKanbanToGantt(newTask);

    store.tasks.push(ganttTask);
    return ganttTask;
  },

  /**
   * Create task from Gantt chart (spec 3.1)
   * Can create both parent tasks and subtasks
   * Syncs to Kanban according to rules
   * TODO: Replace with axios.post('/api/tasks/gantt', taskData)
   */
  async createTaskFromGantt(taskData: Omit<Task, 'id'>): Promise<Task> {
    await delay(400);

    const newTask: Task = {
      ...taskData,
      id: generateId(),
    };

    // Apply sync rules
    const { toAdd, toRemove } = syncGanttToKanban(newTask, store.tasks);

    // Remove parent tasks that should no longer be in Kanban
    store.tasks = store.tasks.filter((t) => !toRemove.includes(t.id));

    // Add the new task
    store.tasks.push(newTask);

    // Add any additional tasks that should be in Kanban
    for (const task of toAdd) {
      const existingIndex = store.tasks.findIndex((t) => t.id === task.id);
      if (existingIndex === -1) {
        store.tasks.push(task);
      }
    }

    return newTask;
  },

  /**
   * Update task status (spec 3.3)
   * Syncs between Kanban and Gantt
   * TODO: Replace with axios.patch(`/api/tasks/${taskId}/status`, { status })
   */
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    await delay(300);

    const taskIndex = store.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('작업을 찾을 수 없습니다.');
    }

    const updatedTask = updateTaskStatus(store.tasks[taskIndex], newStatus);
    store.tasks[taskIndex] = updatedTask;

    return updatedTask;
  },

  /**
   * Update task details
   * TODO: Replace with axios.patch(`/api/tasks/${taskId}`, updates)
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await delay(400);

    const taskIndex = store.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('작업을 찾을 수 없습니다.');
    }

    store.tasks[taskIndex] = { ...store.tasks[taskIndex], ...updates };
    return store.tasks[taskIndex];
  },

  /**
   * Delete a task
   * If deleting a parent task, also deletes all subtasks
   * TODO: Replace with axios.delete(`/api/tasks/${taskId}`)
   */
  async deleteTask(taskId: string): Promise<void> {
    await delay(300);

    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error('작업을 찾을 수 없습니다.');
    }

    // If it's a parent task, delete all subtasks
    if (task.parentTaskId === null) {
      store.tasks = store.tasks.filter(
        (t) => t.id !== taskId && t.parentTaskId !== taskId
      );
    } else {
      // Just delete the subtask
      store.tasks = store.tasks.filter((t) => t.id !== taskId);
    }
  },

  /**
   * Create subtask for a parent task (Gantt only)
   * TODO: Replace with axios.post(`/api/tasks/${parentTaskId}/subtasks`, subtaskData)
   */
  async createSubtask(
    parentTaskId: string,
    subtaskData: Omit<Task, 'id' | 'parentTaskId'>
  ): Promise<Task> {
    await delay(400);

    const parentTask = store.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask) {
      throw new Error('상위 작업을 찾을 수 없습니다.');
    }

    if (parentTask.parentTaskId !== null) {
      throw new Error('서브태스크에는 하위 작업을 추가할 수 없습니다.');
    }

    const newSubtask: Task = {
      ...subtaskData,
      id: generateId(),
      parentTaskId: parentTaskId,
      status: 'todo',
    };

    // Apply sync rules (remove parent from Kanban, add all subtasks)
    const { toAdd, toRemove } = syncGanttToKanban(newSubtask, store.tasks);

    // Remove parent from Kanban
    store.tasks = store.tasks.filter((t) => !toRemove.includes(t.id));

    // Add the new subtask
    store.tasks.push(newSubtask);

    return newSubtask;
  },
};
