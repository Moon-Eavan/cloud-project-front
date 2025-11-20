// Application constants

// Calendar colors
export const CALENDAR_COLORS = {
  google: '#2c7fff',
  local: '#84cc16',
  ecampus: '#a855f7',
} as const;

// Task status colors
export const TASK_STATUS_COLORS = {
  todo: '#9ca3af',
  progress: '#2c7fff',
  done: '#84cc16',
} as const;

// Task status labels
export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  progress: 'In Progress',
  done: 'Done',
} as const;

// Calendar type labels
export const CALENDAR_TYPE_LABELS = {
  google: 'Google Calendar',
  local: 'Calendar',
  ecampus: 'E-Campus',
} as const;

// Notification type labels
export const NOTIFICATION_TYPE_LABELS = {
  friend_request: '친구 요청',
  group_schedule_added: '그룹 일정 등록',
  group_invitation: '그룹 초대',
  schedule_reminder: '일정 알림',
} as const;
