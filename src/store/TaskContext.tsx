import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, TaskStatus } from '../types';
import * as taskApi from '../api/taskApi';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // CRUD 작업
  loadTasks: () => Promise<void>;
  createTask: (input: { title: string; description?: string; startDate: Date; endDate: Date; parentTaskId?: string | null }) => Promise<Task>;
  updateTask: (id: string, input: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // 상태 변경 (Kanban용)
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;

  // Schedule에서 Task 생성
  createTaskFromSchedule: (title: string, description: string, endDate: Date) => Promise<Task>;

  // 헬퍼 함수
  getKanbanTasks: () => Task[];
  getParentTasks: () => Task[];
  getSubtasks: (parentId: string) => Task[];
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 Task 로드
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Task 생성
  const createTask = useCallback(async (input: { title: string; description?: string; startDate: Date; endDate: Date; parentTaskId?: string | null }) => {
    const newTask = await taskApi.createTask({
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'todo',
      parentTaskId: input.parentTaskId || null,
    });
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  // Task 수정
  const updateTask = useCallback(async (id: string, input: Partial<Task>) => {
    const updatedTask = await taskApi.updateTask(id, input);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  }, []);

  // Task 삭제
  const deleteTask = useCallback(async (id: string) => {
    await taskApi.deleteTask(id);
    // subtasks도 함께 삭제
    setTasks(prev => prev.filter(t => t.id !== id && t.parentTaskId !== id));
  }, []);

  // Task 상태 변경
  // spec.md 규칙: status가 done이 되면 Gantt에서도 취소선 표시
  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    const updatedTask = await taskApi.updateTaskStatus(id, status);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  }, []);

  // Schedule에서 Task 생성
  // spec.md 규칙:
  // - startDate = 오늘 날짜
  // - endDate = schedule의 end 날짜
  // - status = todo
  // - parentTaskId = null (parent task로 생성)
  const createTaskFromSchedule = useCallback(async (title: string, description: string, endDate: Date) => {
    const newTask = await taskApi.createTaskFromSchedule(title, description, endDate);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  // Kanban에 표시할 Task 목록
  // spec.md 규칙:
  // - subtask가 없는 parent task는 표시
  // - subtask가 있는 parent task는 표시하지 않고, subtasks만 표시
  const getKanbanTasks = useCallback(() => {
    const parentTasksWithSubtasks = new Set(
      tasks.filter(t => t.parentTaskId !== null).map(t => t.parentTaskId)
    );

    return tasks.filter(task => {
      if (task.parentTaskId !== null) return true;
      return !parentTasksWithSubtasks.has(task.id);
    });
  }, [tasks]);

  // Parent tasks만 가져오기
  const getParentTasks = useCallback(() => {
    return tasks.filter(t => t.parentTaskId === null);
  }, [tasks]);

  // 특정 parent의 subtasks 가져오기
  const getSubtasks = useCallback((parentId: string) => {
    return tasks.filter(t => t.parentTaskId === parentId);
  }, [tasks]);

  const value: TaskContextValue = {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    createTaskFromSchedule,
    getKanbanTasks,
    getParentTasks,
    getSubtasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
