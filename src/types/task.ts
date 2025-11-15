// Task 상태
export type TaskStatus = 'todo' | 'progress' | 'done';

// Task: 칸반보드와 Gantt 차트에서 사용되는 작업 단위
export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  parentTaskId: string | null; // null이면 parent task, 값이 있으면 subtask
}

// Task 생성을 위한 입력 타입
export interface CreateTaskInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status?: TaskStatus;
  parentTaskId?: string | null;
}

// Task 수정을 위한 입력 타입
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: TaskStatus;
  parentTaskId?: string | null;
}

// Parent task와 subtasks를 함께 그룹화한 타입 (Gantt 차트용)
export interface TaskGroup {
  parent: Task;
  subtasks: Task[];
}
