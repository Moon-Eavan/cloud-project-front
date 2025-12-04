# UniSync - 통합 일정 관리 플랫폼

대학생을 위한 현대적인 일정 및 할 일 관리 애플리케이션입니다. React, TypeScript, Vite로 구축되었으며 E-Campus(Canvas LMS), Google Calendar와의 통합을 지원합니다.

## Quick Start

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 개발 서버 시작
npm run dev
```

애플리케이션이 **http://localhost:3000**에서 실행됩니다.

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Gateway URL
VITE_API_BASE_URL=http://localhost:8080/api

# Canvas LMS URL (optional)
VITE_CANVAS_URL=https://canvas.instructure.com
```

## 주요 기능

### 인증
- 이메일/비밀번호 기반 회원가입 및 로그인
- JWT 토큰 기반 인증
- 실시간 폼 유효성 검사
- 자동 토큰 갱신
- 보호된 라우트

### 캘린더 관리
- **3가지 캘린더 유형**:
  - **로컬 캘린더**: 서비스 자체 관리 캘린더
  - **Google Calendar**: OAuth 통합 (백엔드 연동 준비 완료)
  - **E-Campus**: 읽기 전용, 토큰 기반 동기화 (백엔드 연동 완료)
- 사이드바에서 캘린더별 가시성 토글
- 색상으로 구분된 월간 뷰
- 일정 생성, 수정, 삭제 (E-Campus 제외)
- 일정을 할 일로 변환
- 완료된 일정 취소선 표시

### 할 일 관리
- **칸반 보드**: 3개 열 (할 일, 진행 중, 완료)
- **간트 차트**: 타임라인 뷰, 부모/하위 작업 계층 구조
- **동기화 규칙**:
  - 하위 작업이 없는 부모 작업만 칸반에 표시
  - 하위 작업 생성 시 부모는 칸반에서 제거되고 모든 하위 작업이 표시됨
  - 칸반에서는 부모 작업만 생성 가능
  - 상태 변경이 칸반과 간트 간 동기화됨
- 완료된 작업 간트 차트에서 취소선 표시

### 친구 & 그룹
- 이메일/ID로 친구 추가
- 친구 요청 시스템 (수락/거절)
- 그룹 생성 (기존 친구만)
- 그룹 일정 조율 (When2Meet 스타일)
- 프라이버시 보호 일정 보기 (타인 일정은 회색 블록으로 표시)
- 자동 공강 시간 찾기
- 그룹 일정 생성 및 관리
- 그룹 멤버 툴팁 표시

### 알림
- 상단 우측 알림 패널
- 친구 요청 알림 (백엔드 연동 준비 완료)
- 그룹 일정 알림
- 읽음/읽지 않음 상태 관리
- 읽지 않은 알림 개수 배지

### 마이페이지
- 프로필 관리
- Google Calendar 연동 (UI 준비 완료)
- E-Campus 토큰 연동 (백엔드 연동 완료)
- 비밀번호 변경
- 계정 설정

## 프로젝트 구조

```
UniSync-front/
├── src/
│   ├── api/                      # API 레이어 (백엔드 통합)
│   │   ├── client.ts             # JWT 인증이 포함된 Axios 클라이언트
│   │   ├── authApi.ts            # 백엔드 연동 완료
│   │   ├── calendarsApi.ts       # 백엔드 연동 완료
│   │   ├── schedulesApi.ts       # 백엔드 연동 완료
│   │   ├── tasksApi.ts           # 백엔드 연동 완료
│   │   ├── friendsApi.ts         # 백엔드 연동 완료
│   │   ├── groupsApi.ts          # 백엔드 연동 완료
│   │   ├── enrollmentsApi.ts     # 백엔드 연동 완료 (E-Campus)
│   │   ├── ecampusApi.ts         # 백엔드 연동 완료
│   │   └── notificationsApi.ts   # Mock (백엔드 API 대기 중)
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   │   └── Sidebar.tsx
│   │   ├── common/               # 공통 컴포넌트
│   │   │   ├── MiniCalendar.tsx
│   │   │   └── ImageWithFallback.tsx
│   │   ├── LoginDialog.tsx
│   │   └── When2MeetScheduler.tsx # 그룹 일정 조율 컴포넌트
│   │
│   ├── features/                 # 기능별 모듈
│   │   ├── auth/
│   │   ├── calendar/
│   │   │   └── components/
│   │   │       └── MonthView.tsx
│   │   ├── tasks/
│   │   │   └── components/
│   │   │       ├── KanbanBoard.tsx
│   │   │       └── GanttChart.tsx
│   │   └── notifications/
│   │       └── components/
│   │           └── NotificationPanel.tsx
│   │
│   ├── pages/                    # 최상위 페이지
│   │   ├── DashboardPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── FriendsPage.tsx
│   │   └── GroupsPage.tsx
│   │
│   ├── mocks/                    # Mock 데이터 (notifications만 사용)
│   │   ├── mockStore.ts
│   │   └── mockData.ts
│   │
│   ├── lib/                      # 유틸리티
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── syncRules.ts          # Task-Kanban-Gantt 동기화 로직
│   │
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   │
│   ├── App.tsx                   # 라우팅이 포함된 메인 앱
│   ├── main.tsx                  # 진입점
│   └── index.css                 # 글로벌 스타일
│
├── spec.md                       # 애플리케이션 명세
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 기술 스택

- **프레임워크**: React 18.3 + TypeScript
- **빌드 도구**: Vite 6.3
- **라우팅**: React Router DOM v7
- **UI 컴포넌트**: shadcn/ui + Radix UI
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React
- **알림**: Sonner
- **날짜 유틸리티**: date-fns
- **HTTP 클라이언트**: axios (백엔드 통합)

## 구현 상태

### 완료 - 백엔드 통합

**통합 완료된 API:**

1. **인증 API** (`authApi.ts`)
   - JWT 기반 로그인/회원가입
   - localStorage에 토큰 관리
   - 페이지 로드 시 자동 토큰 갱신

2. **카테고리 API** (`calendarsApi.ts`)
   - 백엔드: `/api/v1/categories`
   - 캘린더 생성/조회
   - 첫 로그인 시 기본 캘린더 자동 생성
   - 프론트엔드 Calendar 타입으로 매핑

3. **일정 API** (`schedulesApi.ts`)
   - 백엔드: `/api/v1/schedules`
   - 전체 CRUD 작업
   - 상태 업데이트
   - 그룹 일정 생성 지원
   - 타임존 처리 (ISO 8601)

4. **할 일 API** (`tasksApi.ts`)
   - 백엔드: `/api/v1/todos`
   - 부모/하위 작업 계층 구조
   - 상태 매핑 (TODO/IN_PROGRESS/DONE ↔ todo/progress/done)
   - 우선순위 지원 (LOW/MEDIUM/HIGH/URGENT)
   - 자동 카테고리 할당

5. **친구 API** (`friendsApi.ts`)
   - 백엔드: `/api/v1/friends`
   - 친구 검색 (이메일/이름)
   - 친구 요청 전송/수락/거절
   - 친구 목록 조회
   - 대기 중인 요청 조회

6. **그룹 API** (`groupsApi.ts`)
   - 백엔드: `/api/v1/groups`
   - 그룹 생성/조회/삭제
   - 그룹 멤버 관리
   - 공강 시간 찾기 기능

7. **수강 과목 API** (`enrollmentsApi.ts`)
   - 백엔드: `/api/v1/enrollments`
   - E-Campus 과목 목록 조회
   - 동기화 토글 관리

8. **E-Campus API** (`ecampusApi.ts`)
   - 백엔드: `/api/v1/ecampus`
   - Canvas LMS 토큰 등록/해제
   - 과목 및 과제 동기화

### Mock 구현 (백엔드 대기 중)

1. **알림 API** (`notificationsApi.ts`)
   - 현재 메모리 기반 mock 사용
   - UI 준비 완료
   - 백엔드 API 개발 대기 중

## 테스트

### 백엔드 테스트

**사전 요구사항:**
- `localhost:8080`에서 실행 중인 백엔드 서비스 (API Gateway)
- Docker 서비스 실행 중 (MySQL, LocalStack)

**테스트 플로우:**

1. **회원가입 & 로그인** (실제 백엔드)
   - 이메일/비밀번호로 계정 생성
   - JWT 토큰이 localStorage에 저장됨
   - 대시보드로 자동 리디렉션

2. **캘린더 관리** (실제 백엔드)
   - 첫 로그인 시 기본 캘린더 자동 생성
   - 일정 생성/수정/삭제
   - 페이지 새로고침 후에도 일정 유지
   - 캘린더 가시성 토글

3. **할 일 관리** (실제 백엔드)
   - 칸반 보드에서 작업 생성
   - 작업이 백엔드와 동기화되고 유지됨
   - 작업을 열 간 이동 (todo/progress/done)
   - 간트 차트에서 작업 보기
   - 간트에서 하위 작업 생성
   - 칸반과 간트 간 상태 변경 동기화

4. **친구 & 그룹** (실제 백엔드)
   - 이메일로 친구 검색 및 요청
   - 친구 요청 수락/거절
   - 친구로 그룹 생성
   - 그룹 일정 생성
   - When2Meet 스타일 일정 조율

5. **E-Campus 연동** (실제 백엔드)
   - Canvas LMS 토큰 등록
   - 과목 목록 불러오기
   - 과목별 동기화 활성화/비활성화
   - 과제 자동 동기화

6. **데이터 영속성** (작동 중)
   - 로그인 시 백엔드에서 모든 데이터 가져오기
   - 생성/수정/삭제 작업이 백엔드와 동기화됨
   - 페이지 새로고침 후에도 모든 데이터 유지

### 알려진 제한사항

- **알림**: UI 준비 완료, 백엔드 통합 대기 중
- **Google Calendar**: UI 준비 완료, OAuth 플로우 대기 중

## 주요 구현 세부사항

### Task-Kanban-Gantt 동기화 규칙

spec.md 섹션 3의 동기화 규칙 구현:

```typescript
// lib/syncRules.ts에서
export function getKanbanTasks(allTasks: Task[]): Task[] {
  return allTasks.filter((task) => {
    if (task.parentTaskId) return true; // 모든 하위 작업 표시
    const hasSubtasks = allTasks.some((t) => t.parentTaskId === task.id);
    return !hasSubtasks; // 하위 작업이 없는 경우에만 부모 표시
  });
}
```

### 캘린더 가시성

사이드바에서 캘린더를 켜고 끌 수 있습니다. 보이는 캘린더의 일정만 렌더링됩니다:

```typescript
const filteredSchedules = schedules.filter(schedule => {
  const calendar = calendars.find(c => c.id === schedule.calendarId);
  return calendar?.isVisible;
});
```

### 일정을 할 일로 변환

spec.md 섹션 4.2에 따라 일정을 작업으로 변환:
- 새 부모 작업 생성
- `startDate` = 오늘
- `endDate` = 일정의 종료 날짜
- `status` = 'todo'
- 칸반과 간트 모두에 표시됨

### 그룹 일정 조율

When2Meet 스타일의 일정 조율:
- 그룹 멤버들의 일정을 시각적으로 표시
- 회색 블록으로 타인의 바쁜 시간 표시 (프라이버시 보호)
- 모든 멤버가 비어있는 시간 자동 찾기
- 클릭하여 선택된 시간에 그룹 일정 생성

## 디자인 시스템

### 색상

- **로컬 캘린더**: `#84cc16` (Green)
- **Google Calendar**: `#2c7fff` (Blue)
- **E-Campus**: `#a855f7` (Purple)
- **작업 상태**:
  - 할 일: Gray
  - 진행 중: Blue
  - 완료: Green
- **Primary**: Blue (`#3b82f6`)

### 타이포그래피

- 한글 폰트 지원
- 시스템 폰트 스택 (fallback 포함)
- 반응형 텍스트 크기

## 반응형 디자인

- 데스크톱 우선 접근
- 모바일 네비게이션 드로어
- 반응형 그리드 레이아웃
- 터치 친화적 UI 요소

## 보안 고려사항

**현재 구현:**
- JWT 토큰 기반 인증
- localStorage에 토큰 저장
- axios interceptor로 자동 토큰 첨부
- 만료된 토큰 자동 처리

**프로덕션 권장사항:**
- HTTPS 전용
- CSRF 보호
- API 엔드포인트 속도 제한
- 민감 정보 암호화
- XSS 방지

## 배포 체크리스트

### 백엔드 통합
- [x] 인증 API 실제 백엔드로 교체 (JWT)
- [x] 캘린더 API를 categories 엔드포인트로 교체
- [x] 일정 API 백엔드 연동
- [x] 할 일 API를 todos 엔드포인트로 교체
- [x] 기본 캘린더 자동 생성 구현
- [x] 친구 API 통합
- [x] 그룹 API 통합
- [x] E-Campus 동기화 구현
- [ ] 알림 API 통합
- [ ] Google Calendar OAuth 구현

### 프로덕션 준비
- [x] API URL을 위한 환경 변수
- [x] 토큰 갱신이 포함된 JWT 인증
- [x] API 레이어 오류 처리
- [x] 포괄적인 로딩 상태
- [ ] 오류 추적 설정 (예: Sentry)
- [ ] 오류 경계 추가
- [ ] 분석 추가
- [ ] 번들 크기 최적화
- [ ] PWA를 위한 서비스 워커 추가
- [ ] CI/CD 파이프라인 설정

## 최근 업데이트

### 2025-01-04
- 친구 API 백엔드 통합 완료
- 그룹 API 백엔드 통합 완료
- E-Campus (Canvas LMS) 연동 완료
- 그룹 일정 생성 시 그룹 탭에 자동 추가
- 그룹 일정 멤버 툴팁 표시
- 사이드바 타이틀 "Calendar" → "UniSync" 변경
- 디자인 통일 (버튼 색상)
- 하드코딩된 알림 제거

## 라이선스

Private project

## 크레딧

[spec.md](spec.md)의 명세를 따라 제작되었습니다.
