import { Schedule, CreateScheduleInput, UpdateScheduleInput } from '../types';

// Mock 데이터 저장소
let mockSchedules: Schedule[] = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 팀 미팅',
    start: new Date(2025, 10, 5, 14, 0),
    end: new Date(2025, 10, 5, 15, 0),
    location: '회의실 A',
    isCompleted: false,
    color: 'blue',
    source: 'manual',
  },
  {
    id: '2',
    title: '프로젝트 마감',
    description: '1차 프로젝트 마감',
    start: new Date(2025, 10, 15, 23, 59),
    end: new Date(2025, 10, 15, 23, 59),
    location: '',
    isCompleted: false,
    color: 'red',
    source: 'ecampus',
  },
  {
    id: '3',
    title: '점심 약속',
    description: '클라이언트 미팅',
    start: new Date(2025, 10, 12, 12, 30),
    end: new Date(2025, 10, 12, 14, 0),
    location: '강남역 근처',
    isCompleted: false,
    color: 'green',
    source: 'google',
  },
];

// 모든 일정 조회
export async function getSchedules(): Promise<Schedule[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/schedules');
  // return response.data;

  return Promise.resolve([...mockSchedules]);
}

// 특정 날짜 범위의 일정 조회
export async function getSchedulesByDateRange(start: Date, end: Date): Promise<Schedule[]> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get('/schedules', {
  //   params: { start: start.toISOString(), end: end.toISOString() }
  // });
  // return response.data;

  return Promise.resolve(
    mockSchedules.filter(
      (schedule) => schedule.start >= start && schedule.end <= end
    )
  );
}

// 단일 일정 조회
export async function getSchedule(id: string): Promise<Schedule | null> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.get(`/schedules/${id}`);
  // return response.data;

  const schedule = mockSchedules.find((s) => s.id === id);
  return Promise.resolve(schedule || null);
}

// 일정 생성
export async function createSchedule(input: CreateScheduleInput): Promise<Schedule> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.post('/schedules', input);
  // return response.data;

  const newSchedule: Schedule = {
    id: Date.now().toString(),
    title: input.title,
    description: input.description,
    start: input.start,
    end: input.end,
    location: input.location,
    isCompleted: input.isCompleted || false,
    color: input.color || 'blue',
    source: 'manual',
  };

  mockSchedules.push(newSchedule);
  return Promise.resolve(newSchedule);
}

// 일정 수정
export async function updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.put(`/schedules/${id}`, input);
  // return response.data;

  const index = mockSchedules.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Schedule not found');
  }

  mockSchedules[index] = {
    ...mockSchedules[index],
    ...input,
  };

  return Promise.resolve(mockSchedules[index]);
}

// 일정 삭제
export async function deleteSchedule(id: string): Promise<void> {
  // TODO: axios로 실제 API 호출
  // await apiClient.delete(`/schedules/${id}`);

  mockSchedules = mockSchedules.filter((s) => s.id !== id);
  return Promise.resolve();
}

// 일정 완료 상태 토글
export async function toggleScheduleCompleted(id: string): Promise<Schedule> {
  // TODO: axios로 실제 API 호출
  // const response = await apiClient.patch(`/schedules/${id}/toggle-completed`);
  // return response.data;

  const index = mockSchedules.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Schedule not found');
  }

  mockSchedules[index].isCompleted = !mockSchedules[index].isCompleted;
  return Promise.resolve(mockSchedules[index]);
}

// Mock 데이터 초기화 (테스트용)
export function resetMockSchedules(): void {
  mockSchedules = [
    {
      id: '1',
      title: '팀 미팅',
      description: '주간 팀 미팅',
      start: new Date(2025, 10, 5, 14, 0),
      end: new Date(2025, 10, 5, 15, 0),
      location: '회의실 A',
      isCompleted: false,
      color: 'blue',
      source: 'manual',
    },
    {
      id: '2',
      title: '프로젝트 마감',
      description: '1차 프로젝트 마감',
      start: new Date(2025, 10, 15, 23, 59),
      end: new Date(2025, 10, 15, 23, 59),
      location: '',
      isCompleted: false,
      color: 'red',
      source: 'ecampus',
    },
    {
      id: '3',
      title: '점심 약속',
      description: '클라이언트 미팅',
      start: new Date(2025, 10, 12, 12, 30),
      end: new Date(2025, 10, 12, 14, 0),
      location: '강남역 근처',
      isCompleted: false,
      color: 'green',
      source: 'google',
    },
  ];
}
