/**
 * Task status enumeration
 * @typedef {'todo' | 'progress' | 'done'} TaskStatus
 */

/**
 * Task object structure
 * @typedef {Object} Task
 * @property {string} id - Unique identifier
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {TaskStatus} status - Current status
 * @property {Date} startDate - Start date
 * @property {Date} endDate - End date
 * @property {string} color - Task color (hex)
 * @property {Date} createdAt - Creation timestamp
 */

export const TASK_STATUS = {
  TODO: 'todo',
  PROGRESS: 'progress',
  DONE: 'done'
};

export const TASK_COLORS = {
  BLUE: '#2c7fff',
  GREEN: '#24b400',
  RED: '#ff0707',
  YELLOW: '#ffc107',
  PURPLE: '#9c27b0'
};
