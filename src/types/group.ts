import { User } from './user';
import { Schedule } from './schedule';

// 그룹
export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdAt: Date;
  createdBy: string; // User ID
}

// 그룹 멤버
export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

// 그룹 생성 입력
export interface CreateGroupInput {
  name: string;
  description?: string;
  memberIds: string[]; // 친구 ID 목록 (친구만 초대 가능)
}

// 그룹 일정 (그룹원들이 공유하는 일정)
export interface GroupSchedule {
  id: string;
  groupId: string;
  scheduleId: string; // 실제 Schedule의 ID
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  participants: string[]; // 참여자 User ID 목록
  createdBy: string;
  createdAt: Date;
}

// 일정 조율용 시간 슬롯
export interface TimeSlot {
  date: Date;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  isAvailable: boolean;
}

// 일정 조율 세션
export interface ScheduleCoordinationSession {
  id: string;
  groupId: string;
  memberIds: string[];
  startDate: Date;
  endDate: Date;
  availableSlots: Map<string, TimeSlot[]>; // userId -> available slots
  createdAt: Date;
}

// 일정 추가 입력 (그룹용)
export interface CreateGroupScheduleInput {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  memberIds: string[]; // 참여 멤버 ID 목록
}
