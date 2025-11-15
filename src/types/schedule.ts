// Schedule: 캘린더에 표시되는 시간 기반 일정
export interface Schedule {
  id: string;
  title: string;
  description?: string;
  start: Date; // 시작 날짜+시간
  end: Date;   // 종료 날짜+시간
  location?: string;
  isCompleted: boolean; // true면 캘린더에서 취소선으로 표시
  color?: string; // UI 표시용 색상
  source?: 'manual' | 'ecampus' | 'google'; // 일정 출처
}

// Schedule 생성을 위한 입력 타입
export interface CreateScheduleInput {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  isCompleted?: boolean;
  color?: string;
}

// Schedule 수정을 위한 입력 타입
export interface UpdateScheduleInput {
  title?: string;
  description?: string;
  start?: Date;
  end?: Date;
  location?: string;
  isCompleted?: boolean;
  color?: string;
}
