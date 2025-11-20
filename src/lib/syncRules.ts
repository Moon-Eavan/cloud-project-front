// Task-Kanban-Gantt Sync Rules (spec.md section 3)
// This file contains the business logic for syncing tasks between Kanban and Gantt views

import type { Task, TaskStatus } from '@/types';

/**
 * Get tasks that should be displayed in Kanban board
 * According to spec 3.1 and 3.2:
 * - Subtasks are always shown
 * - Parent tasks are only shown if they have no subtasks
 */
export function getKanbanTasks(allTasks: Task[]): Task[] {
  return allTasks.filter((task) => {
    // If it's a subtask, show it
    if (task.parentTaskId) return true;

    // If it's a parent task, only show if it has no subtasks
    const hasSubtasks = allTasks.some((t) => t.parentTaskId === task.id);
    return !hasSubtasks;
  });
}

/**
 * Handle task creation from Gantt chart (spec 3.1)
 * Returns the tasks that should be added/removed from Kanban
 */
export function syncGanttToKanban(
  newTask: Task,
  allTasks: Task[]
): { toAdd: Task[]; toRemove: string[] } {
  const toAdd: Task[] = [];
  const toRemove: string[] = [];

  if (newTask.parentTaskId === null) {
    // Creating a parent task in Gantt
    const hasSubtasks = allTasks.some((t) => t.parentTaskId === newTask.id);

    if (!hasSubtasks) {
      // Parent task with no subtasks → Add to Kanban todo
      toAdd.push({ ...newTask, status: 'todo' });
    }
  } else {
    // Creating a subtask in Gantt
    const parentId = newTask.parentTaskId;

    // Remove parent from Kanban if it exists
    toRemove.push(parentId);

    // Add this subtask to Kanban todo
    toAdd.push({ ...newTask, status: 'todo' });

    // Add all sibling subtasks to Kanban todo if not already there
    const siblingSubtasks = allTasks.filter(
      (t) => t.parentTaskId === parentId && t.id !== newTask.id
    );
    toAdd.push(...siblingSubtasks.map((t) => ({ ...t, status: 'todo' as TaskStatus })));
  }

  return { toAdd, toRemove };
}

/**
 * Handle task creation from Kanban board (spec 3.2)
 * Kanban can only create parent tasks
 * Returns the task that should also be created in Gantt
 */
export function syncKanbanToGantt(newTask: Task): Task {
  // Kanban always creates parent tasks
  return {
    ...newTask,
    parentTaskId: null,
  };
}

/**
 * Handle task status change (spec 3.3)
 * Returns updated task with new status
 */
export function updateTaskStatus(task: Task, newStatus: TaskStatus): Task {
  return {
    ...task,
    status: newStatus,
  };
}

/**
 * Check if a task should show strikethrough (done status)
 */
export function shouldShowStrikethrough(task: Task): boolean {
  return task.status === 'done';
}

/**
 * Get parent task for a given subtask
 */
export function getParentTask(subtaskId: string, allTasks: Task[]): Task | null {
  const subtask = allTasks.find((t) => t.id === subtaskId);
  if (!subtask || !subtask.parentTaskId) return null;

  return allTasks.find((t) => t.id === subtask.parentTaskId) || null;
}

/**
 * Get all subtasks for a given parent task
 */
export function getSubtasks(parentTaskId: string, allTasks: Task[]): Task[] {
  return allTasks.filter((t) => t.parentTaskId === parentTaskId);
}

/**
 * Check if a task is a parent task
 */
export function isParentTask(task: Task): boolean {
  return task.parentTaskId === null;
}

/**
 * Check if a task is a subtask
 */
export function isSubtask(task: Task): boolean {
  return task.parentTaskId !== null;
}
