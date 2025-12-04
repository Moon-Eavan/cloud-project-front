// Initial seed data for development
// This populates the mock store with sample data

import type { User, Calendar, Schedule, Task, Friend, Group, Notification } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  name: '김민수',
  email: 'minsu@example.com',
  profileImage: undefined,
  googleConnected: false,
  ecampusToken: undefined,
};

export const mockCalendars: Calendar[] = [
  {
    id: 'cal-google',
    name: 'Google Calendar',
    type: 'google',
    color: '#2c7fff',
    isVisible: true,
  },
  {
    id: 'cal-local',
    name: 'Calendar',
    type: 'local',
    color: '#84cc16',
    isVisible: true,
  },
  {
    id: 'cal-ecampus',
    name: 'E-Campus',
    type: 'ecampus',
    color: '#a855f7',
    isVisible: true,
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    title: '팀 미팅',
    description: '주간 팀 미팅',
    start: new Date(2025, 10, 5, 14, 0),
    end: new Date(2025, 10, 5, 15, 0),
    location: '회의실 A',
    isCompleted: false,
    calendarId: 'cal-google',
  },
  {
    id: 'sch-2',
    title: '프로젝트 마감',
    description: '1차 프로젝트 마감',
    start: new Date(2025, 10, 15, 9, 0),
    end: new Date(2025, 10, 15, 18, 0),
    isCompleted: false,
    calendarId: 'cal-local',
  },
  {
    id: 'sch-3',
    title: '점심 약속',
    description: '클라이언트 미팅',
    start: new Date(2025, 10, 12, 12, 30),
    end: new Date(2025, 10, 12, 14, 0),
    location: '강남역 근처',
    isCompleted: false,
    calendarId: 'cal-local',
  },
  {
    id: 'sch-4',
    title: '웹프로그래밍 과제 제출',
    description: '2주차 과제 마감',
    start: new Date(2025, 10, 20, 23, 59),
    end: new Date(2025, 10, 20, 23, 59),
    isCompleted: false,
    calendarId: 'cal-ecampus',
  },
  {
    id: 'sch-5',
    title: '데이터베이스 강의',
    description: '중간고사 관련 공지',
    start: new Date(2025, 10, 8, 10, 0),
    end: new Date(2025, 10, 8, 12, 0),
    location: '공학관 301호',
    isCompleted: true,
    calendarId: 'cal-ecampus',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '프로젝트 기획서 작성',
    description: '프로젝트 초기 기획서 작성',
    startDate: new Date(2025, 10, 1),
    endDate: new Date(2025, 10, 5),
    status: 'todo',
    parentTaskId: null,
  },
  {
    id: 'task-2',
    title: 'UI 디자인',
    description: '메인 화면 디자인',
    startDate: new Date(2025, 10, 6),
    endDate: new Date(2025, 10, 10),
    status: 'progress',
    parentTaskId: null,
  },
  {
    id: 'task-3',
    title: '데이터베이스 설계',
    description: 'ERD 작성',
    startDate: new Date(2025, 10, 11),
    endDate: new Date(2025, 10, 15),
    status: 'done',
    parentTaskId: null,
  },
];

export const mockFriends: Friend[] = [
  {
    id: 'friend-1',
    name: '김민수',
    email: 'minsu.kim@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-2',
    name: '이지은',
    email: 'jieun.lee@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-3',
    name: '박서준',
    email: 'seojun.park@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
];

export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: '소프트웨어 공학 팀프로젝트',
    memberIds: ['user-1', 'friend-1', 'friend-2'],
    createdBy: 'user-1',
    createdAt: new Date(2025, 9, 1),
  },
  {
    id: 'group-2',
    name: '알고리즘 스터디',
    memberIds: ['user-1', 'friend-2', 'friend-3'],
    createdBy: 'user-1',
    createdAt: new Date(2025, 9, 15),
  },
];

export const mockNotifications: Notification[] = [];
