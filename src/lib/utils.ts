import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷팅 유틸리티
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
export function getTodayDate(): string {
  return formatDate(new Date());
}

// 현재 시간의 정각을 반환 (예: 14:35 -> 14:00)
export function getCurrentHour(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  return `${hours}:00`;
}

// 현재 시간 + N시간을 반환
export function getCurrentHourPlus(hours: number): string {
  const now = new Date();
  const newHours = (now.getHours() + hours).toString().padStart(2, '0');
  return `${newHours}:00`;
}

// ID 생성
export function generateId(): string {
  return Date.now().toString();
}

// 두 날짜가 같은 날인지 확인
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 오늘인지 확인
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
