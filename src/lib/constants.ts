// 색상 옵션
export const SCHEDULE_COLORS = [
  { value: 'blue', label: '파란색', bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-100', border: 'border-blue-200' },
  { value: 'red', label: '빨간색', bg: 'bg-red-500', text: 'text-red-700', bgLight: 'bg-red-100', border: 'border-red-200' },
  { value: 'green', label: '초록색', bg: 'bg-green-500', text: 'text-green-700', bgLight: 'bg-green-100', border: 'border-green-200' },
  { value: 'purple', label: '보라색', bg: 'bg-purple-500', text: 'text-purple-700', bgLight: 'bg-purple-100', border: 'border-purple-200' },
  { value: 'orange', label: '주황색', bg: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-100', border: 'border-orange-200' },
  { value: 'pink', label: '분홍색', bg: 'bg-pink-500', text: 'text-pink-700', bgLight: 'bg-pink-100', border: 'border-pink-200' },
] as const;

export type ScheduleColor = typeof SCHEDULE_COLORS[number]['value'];

// 요일 이름
export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

// 월 이름
export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

// Kanban 컬럼
export const KANBAN_COLUMNS = [
  { id: 'todo' as const, title: 'To Do', color: 'border-t-gray-400' },
  { id: 'progress' as const, title: 'In Progress', color: 'border-t-blue-500' },
  { id: 'done' as const, title: 'Done', color: 'border-t-green-500' },
] as const;

// Task 상태 레이블
export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  progress: 'In Progress',
  done: 'Done',
} as const;
