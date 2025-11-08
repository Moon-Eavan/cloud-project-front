import { createContext, useContext, useState, useCallback } from 'react';
import { TASK_STATUS, TASK_COLORS } from '../types';

const TaskContext = createContext(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'UI 디자인 기획',
      description: '프로젝트 웹 디자인 완성하기',
      status: TASK_STATUS.TODO,
      startDate: new Date('2025-11-07'),
      endDate: new Date('2025-11-09'),
      color: TASK_COLORS.BLUE,
      createdAt: new Date()
    },
    {
      id: '2',
      title: '중요도 표시는?',
      description: '색깔로 구분할 수 있는 우선순위?',
      status: TASK_STATUS.TODO,
      startDate: new Date('2025-11-08'),
      endDate: new Date('2025-11-10'),
      color: TASK_COLORS.GREEN,
      createdAt: new Date()
    }
  ]);

  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Add new task
  const addTask = useCallback((taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: taskData.status || TASK_STATUS.TODO,
      color: taskData.color || TASK_COLORS.BLUE,
      createdAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
    setShowTaskPopup(false);
    setEditingTask(null);
  }, []);

  // Update task status
  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }, []);

  // Update task
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    setShowTaskPopup(false);
    setEditingTask(null);
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // Open task popup for editing
  const openEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowTaskPopup(true);
  }, []);

  // Open task popup for new task
  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setShowTaskPopup(true);
  }, []);

  // Close task popup
  const closeTaskPopup = useCallback(() => {
    setShowTaskPopup(false);
    setEditingTask(null);
  }, []);

  // Get tasks by status
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const value = {
    tasks,
    taskPopupState: {
      isOpen: showTaskPopup,
      task: editingTask
    },
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    openEditTask,
    openNewTask,
    closeTaskPopup,
    getTasksByStatus
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
