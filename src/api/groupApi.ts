import { Group, CreateGroupInput, GroupSchedule, CreateGroupScheduleInput, GroupMember } from '../types';
import { createSchedule } from './scheduleApi';

// Mock 데이터 저장소
let mockGroups: Group[] = [
  {
    id: '1',
    name: '클라우드 프로젝트 팀',
    description: '클라우드 컴퓨팅 수업 프로젝트',
    members: [
      {
        userId: 'current-user',
        name: '나',
        email: 'me@khu.ac.kr',
        role: 'admin',
        joinedAt: new Date(2025, 9, 1),
      },
      {
        userId: 'user-1',
        name: '김철수',
        email: 'kim@khu.ac.kr',
        role: 'member',
        joinedAt: new Date(2025, 9, 1),
      },
      {
        userId: 'user-2',
        name: '이영희',
        email: 'lee@khu.ac.kr',
        role: 'member',
        joinedAt: new Date(2025, 9, 1),
      },
    ],
    createdAt: new Date(2025, 9, 1),
    createdBy: 'current-user',
  },
];

let mockGroupSchedules: GroupSchedule[] = [];

// 그룹 목록 조회
export async function getGroups(): Promise<Group[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/groups');
  // return response.data;

  return Promise.resolve([...mockGroups]);
}

// 단일 그룹 조회
export async function getGroup(id: string): Promise<Group | null> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get(`/groups/${id}`);
  // return response.data;

  const group = mockGroups.find((g) => g.id === id);
  return Promise.resolve(group || null);
}

// 그룹 생성
// spec.md 규칙: 친구로 추가된 사용자만 멤버로 선택 가능
export async function createGroup(input: CreateGroupInput): Promise<Group> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/groups', input);
  // return response.data;

  const members: GroupMember[] = [
    // 현재 사용자 (생성자)
    {
      userId: 'current-user',
      name: '나',
      email: 'me@khu.ac.kr',
      role: 'admin',
      joinedAt: new Date(),
    },
    // 선택된 친구들
    ...input.memberIds.map((userId) => ({
      userId,
      name: `사용자 ${userId}`,
      email: `${userId}@khu.ac.kr`,
      role: 'member' as const,
      joinedAt: new Date(),
    })),
  ];

  const newGroup: Group = {
    id: Date.now().toString(),
    name: input.name,
    description: input.description,
    members,
    createdAt: new Date(),
    createdBy: 'current-user',
  };

  mockGroups.push(newGroup);
  return Promise.resolve(newGroup);
}

// 그룹 삭제
export async function deleteGroup(id: string): Promise<void> {
  // TODO: axios로 실제 API 호출
  // await apiClient.delete(`/groups/${id}`);

  mockGroups = mockGroups.filter((g) => g.id !== id);
  mockGroupSchedules = mockGroupSchedules.filter((s) => s.groupId !== id);
  return Promise.resolve();
}

// 그룹 일정 추가
// spec.md 규칙:
// - 선택된 멤버 각각의 캘린더에 schedule로 생성
// - 각 멤버에게 알림 발송 (TODO: 알림 시스템)
// - 그룹 탭에서도 조회 가능
export async function addGroupSchedule(
  groupId: string,
  input: CreateGroupScheduleInput
): Promise<GroupSchedule> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post(`/groups/${groupId}/schedules`, input);
  // return response.data;

  // 각 참여 멤버의 캘린더에 일정 생성
  const schedule = await createSchedule({
    title: input.title,
    description: input.description,
    start: input.start,
    end: input.end,
    location: input.location,
  });

  const groupSchedule: GroupSchedule = {
    id: Date.now().toString(),
    groupId,
    scheduleId: schedule.id,
    title: input.title,
    description: input.description,
    location: input.location,
    start: input.start,
    end: input.end,
    participants: input.memberIds,
    createdBy: 'current-user',
    createdAt: new Date(),
  };

  mockGroupSchedules.push(groupSchedule);

  // TODO: 각 멤버에게 알림 발송
  // await notifyMembers(input.memberIds, groupSchedule);

  return Promise.resolve(groupSchedule);
}

// 그룹 일정 목록 조회
export async function getGroupSchedules(groupId: string): Promise<GroupSchedule[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get(`/groups/${groupId}/schedules`);
  // return response.data;

  return Promise.resolve(mockGroupSchedules.filter((s) => s.groupId === groupId));
}

// 일정 조율용: 특정 기간의 멤버별 일정 조회
// spec.md 규칙:
// - 다른 사람의 일정: 회색 블록만 표시 (제목/내용 비공개)
// - 내 일정: 회색 블록 + 제목 표시
export async function getMemberAvailability(
  memberIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Map<string, { start: Date; end: Date; isOwn: boolean; title?: string }[]>> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/groups/availability', {
  //   memberIds,
  //   startDate,
  //   endDate,
  // });
  // return response.data;

  // Mock: 각 멤버의 가상 일정 생성
  const availability = new Map<string, { start: Date; end: Date; isOwn: boolean; title?: string }[]>();

  memberIds.forEach((memberId) => {
    const slots: { start: Date; end: Date; isOwn: boolean; title?: string }[] = [];

    // 랜덤하게 몇 개의 일정 생성
    const numSlots = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numSlots; i++) {
      const dayOffset = Math.floor(Math.random() * 7);
      const hour = Math.floor(Math.random() * 10) + 9; // 9-18시
      const slotDate = new Date(startDate);
      slotDate.setDate(slotDate.getDate() + dayOffset);
      slotDate.setHours(hour, 0, 0, 0);

      const endSlot = new Date(slotDate);
      endSlot.setHours(hour + 1);

      const isOwn = memberId === 'current-user';
      slots.push({
        start: slotDate,
        end: endSlot,
        isOwn,
        title: isOwn ? '내 일정' : undefined,
      });
    }

    availability.set(memberId, slots);
  });

  return Promise.resolve(availability);
}

// Mock 데이터 초기화 (테스트용)
export function resetMockGroups(): void {
  mockGroups = [
    {
      id: '1',
      name: '클라우드 프로젝트 팀',
      description: '클라우드 컴퓨팅 수업 프로젝트',
      members: [
        {
          userId: 'current-user',
          name: '나',
          email: 'me@khu.ac.kr',
          role: 'admin',
          joinedAt: new Date(2025, 9, 1),
        },
        {
          userId: 'user-1',
          name: '김철수',
          email: 'kim@khu.ac.kr',
          role: 'member',
          joinedAt: new Date(2025, 9, 1),
        },
        {
          userId: 'user-2',
          name: '이영희',
          email: 'lee@khu.ac.kr',
          role: 'member',
          joinedAt: new Date(2025, 9, 1),
        },
      ],
      createdAt: new Date(2025, 9, 1),
      createdBy: 'current-user',
    },
  ];
  mockGroupSchedules = [];
}
