// ============================================
// Type Definitions based on spec.md
// ============================================

// Calendar Types
export type CalendarType = 'google' | 'local' | 'ecampus';

export interface Calendar {
  id: string;
  name: string;
  type: CalendarType;
  color: string;
  isVisible: boolean;
  sourceId?: string; // For Canvas/Google integration - stores external course/calendar ID
}

// Schedule Types
export interface Schedule {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  isCompleted: boolean;
  calendarId: string; // References Calendar.id
  groupId?: string; // References Group.id (for group schedules)
}

// Task Types
export type TaskStatus = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  parentTaskId: string | null; // null = parent task, string = subtask
  scheduleId?: string; // Optional - links to schedule if created from schedule
  deadline?: Date; // Optional - deadline for the task (displayed as red line in Gantt)
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  googleConnected: boolean;
  ecampusToken?: string;
}

// Friend Types
export type FriendStatus = 'pending' | 'accepted' | 'rejected';

export interface Friend {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: FriendStatus;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  fromUserEmail?: string;
  toUserId: string;
  status: FriendStatus;
  createdAt: Date;
}

// Group Types
export interface GroupMember {
  id: string; // cognitoSub
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[]; // User IDs (cognitoSub)
  members?: GroupMember[]; // Full member info from backend
  createdBy: string; // User ID
  createdAt: Date;
}

export interface GroupSchedule {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  memberIds: string[]; // Participating members
  createdBy: string; // User ID
  createdAt: Date;
}

export interface ScheduleCoordination {
  groupId: string;
  memberIds: string[];
  period: {
    start: Date;
    end: Date;
  };
}

// Notification Types
export type NotificationType =
  | 'friend_request'
  | 'group_schedule_added'
  | 'group_invitation'
  | 'schedule_reminder';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedId?: string; // ID of related resource (friend request, group, schedule, etc.)
  actionUrl?: string; // Optional URL to navigate to
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  accessToken?: string; // Backend returns accessToken
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  cognitoSub?: string;
  email?: string;
  name?: string;
  message?: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Member Schedule Info (for coordination view)
export interface MemberScheduleInfo {
  userId: string;
  userName: string;
  schedules: Schedule[];
}

// View-specific Types
export interface CalendarEvent extends Schedule {
  calendarColor: string;
  calendarName: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

// Canvas/E-Campus Types
export interface Course {
  id: number;
  canvasCourseId: number;
  name: string;
  courseCode: string;
  description: string | null;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  cognitoSub: string;
  course: Course;
  isSyncLeader: boolean;
  isSyncEnabled: boolean;
  enrolledAt: string;
}
