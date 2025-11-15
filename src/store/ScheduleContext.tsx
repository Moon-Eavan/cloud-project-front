import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Schedule, CreateScheduleInput, UpdateScheduleInput } from '../types';
import * as scheduleApi from '../api/scheduleApi';

interface ScheduleContextValue {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;

  // CRUD 작업
  loadSchedules: () => Promise<void>;
  createSchedule: (input: CreateScheduleInput) => Promise<Schedule>;
  updateSchedule: (id: string, input: UpdateScheduleInput) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;

  // 헬퍼 함수
  getSchedulesByDate: (date: Date) => Schedule[];
  getSchedulesByMonth: (year: number, month: number) => Schedule[];
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function useScheduleContext(): ScheduleContextValue {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
}

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 Schedule 로드
  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleApi.getSchedules();
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule 생성
  const createSchedule = useCallback(async (input: CreateScheduleInput) => {
    const newSchedule = await scheduleApi.createSchedule(input);
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  }, []);

  // Schedule 수정
  const updateSchedule = useCallback(async (id: string, input: UpdateScheduleInput) => {
    const updatedSchedule = await scheduleApi.updateSchedule(id, input);
    setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
  }, []);

  // Schedule 삭제
  const deleteSchedule = useCallback(async (id: string) => {
    await scheduleApi.deleteSchedule(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  // 완료 상태 토글
  // spec.md 규칙: isCompleted가 true면 캘린더에서 취소선으로 표시
  const toggleCompleted = useCallback(async (id: string) => {
    const updatedSchedule = await scheduleApi.toggleScheduleCompleted(id);
    setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
  }, []);

  // 특정 날짜의 일정 조회
  const getSchedulesByDate = useCallback((date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = schedule.start;
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [schedules]);

  // 특정 월의 일정 조회
  const getSchedulesByMonth = useCallback((year: number, month: number) => {
    return schedules.filter(schedule => {
      const scheduleDate = schedule.start;
      return (
        scheduleDate.getFullYear() === year &&
        scheduleDate.getMonth() === month
      );
    });
  }, [schedules]);

  const value: ScheduleContextValue = {
    schedules,
    loading,
    error,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleCompleted,
    getSchedulesByDate,
    getSchedulesByMonth,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
