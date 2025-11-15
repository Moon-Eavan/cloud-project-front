import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

// Mock 데이터 저장소
let mockTasks: Task[] = [
  {
    id: '1',
    title: '프로젝트 기획서 작성',
    description: '프로젝트 초기 기획서 작성',
    startDate: new Date(2025, 10, 1),
    endDate: new Date(2025, 10, 5),
    status: 'todo',
    parentTaskId: null,
  },
  {
    id: '2',
    title: 'UI 디자인',
    description: '메인 화면 디자인',
    startDate: new Date(2025, 10, 6),
    endDate: new Date(2025, 10, 10),
    status: 'progress',
    parentTaskId: null,
  },
  {
    id: '3',
    title: '데이터베이스 설계',
    description: 'ERD 작성',
    startDate: new Date(2025, 10, 11),
    endDate: new Date(2025, 10, 15),
    status: 'done',
    parentTaskId: null,
  },
];

// 모든 Task 조회
export async function getTasks(): Promise<Task[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/tasks');
  // return response.data;

  return Promise.resolve([...mockTasks]);
}

// Parent tasks만 조회
export async function getParentTasks(): Promise<Task[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/tasks/parents');
  // return response.data;

  return Promise.resolve(mockTasks.filter((t) => t.parentTaskId === null));
}

// 특정 parent task의 subtasks 조회
export async function getSubtasks(parentTaskId: string): Promise<Task[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get(`/tasks/${parentTaskId}/subtasks`);
  // return response.data;

  return Promise.resolve(mockTasks.filter((t) => t.parentTaskId === parentTaskId));
}

// 단일 Task 조회
export async function getTask(id: string): Promise<Task | null> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get(`/tasks/${id}`);
  // return response.data;

  const task = mockTasks.find((t) => t.id === id);
  return Promise.resolve(task || null);
}

// Task 생성 (Kanban 또는 Gantt에서)
// spec.md 규칙: Kanban에서는 parent task만 생성 가능
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/tasks', input);
  // return response.data;

  const newTask: Task = {
    id: Date.now().toString(),
    title: input.title,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status || 'todo',
    parentTaskId: input.parentTaskId || null,
  };

  mockTasks.push(newTask);
  return Promise.resolve(newTask);
}

// Task 수정
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.put(`/tasks/${id}`, input);
  // return response.data;

  const index = mockTasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  mockTasks[index] = {
    ...mockTasks[index],
    ...input,
  };

  return Promise.resolve(mockTasks[index]);
}

// Task 삭제
export async function deleteTask(id: string): Promise<void> {
  // TODO: axios로 실제 API 호출
  // await apiClient.delete(`/tasks/${id}`);

  // subtasks도 함께 삭제
  mockTasks = mockTasks.filter((t) => t.id !== id && t.parentTaskId !== id);
  return Promise.resolve();
}

// Task 상태 변경 (Kanban에서 드래그 앤 드롭)
// spec.md 규칙: status가 done이 되면 Gantt에서도 취소선 표시
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.patch(`/tasks/${id}/status`, { status });
  // return response.data;

  const index = mockTasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  mockTasks[index].status = status;
  return Promise.resolve(mockTasks[index]);
}

// Schedule에서 Task 생성 ("task에 추가" 기능)
// spec.md 규칙:
// - startDate = 오늘 날짜
// - endDate = schedule의 end 날짜
// - status = todo
// - parentTaskId = null (parent task로 생성)
export async function createTaskFromSchedule(
  scheduleTitle: string,
  scheduleDescription: string,
  scheduleEndDate: Date
): Promise<Task> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/tasks/from-schedule', {
  //   title: scheduleTitle,
  //   description: scheduleDescription,
  //   endDate: scheduleEndDate,
  // });
  // return response.data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newTask: Task = {
    id: Date.now().toString(),
    title: scheduleTitle,
    description: scheduleDescription,
    startDate: today,
    endDate: scheduleEndDate,
    status: 'todo',
    parentTaskId: null,
  };

  mockTasks.push(newTask);
  return Promise.resolve(newTask);
}

// Kanban에 표시할 Task 목록 조회
// spec.md 규칙:
// - subtask가 없는 parent task는 표시
// - subtask가 있는 parent task는 표시하지 않고, subtasks만 표시
export async function getKanbanTasks(): Promise<Task[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/tasks/kanban');
  // return response.data;

  const parentTasksWithSubtasks = new Set(
    mockTasks.filter((t) => t.parentTaskId !== null).map((t) => t.parentTaskId)
  );

  return Promise.resolve(
    mockTasks.filter((task) => {
      // subtask인 경우 표시
      if (task.parentTaskId !== null) return true;
      // parent task인 경우 subtask가 없는 경우만 표시
      return !parentTasksWithSubtasks.has(task.id);
    })
  );
}

// Mock 데이터 초기화 (테스트용)
export function resetMockTasks(): void {
  mockTasks = [
    {
      id: '1',
      title: '프로젝트 기획서 작성',
      description: '프로젝트 초기 기획서 작성',
      startDate: new Date(2025, 10, 1),
      endDate: new Date(2025, 10, 5),
      status: 'todo',
      parentTaskId: null,
    },
    {
      id: '2',
      title: 'UI 디자인',
      description: '메인 화면 디자인',
      startDate: new Date(2025, 10, 6),
      endDate: new Date(2025, 10, 10),
      status: 'progress',
      parentTaskId: null,
    },
    {
      id: '3',
      title: '데이터베이스 설계',
      description: 'ERD 작성',
      startDate: new Date(2025, 10, 11),
      endDate: new Date(2025, 10, 15),
      status: 'done',
      parentTaskId: null,
    },
  ];
}
