# 1. 기본 개념

## 1.1 Schedule(캘린더 일정)

- **사용 위치**: 캘린더  

- **필드**
  - `title`: 문자열 (필수)
  - `description`: 문자열 (선택)
  - `start`: 날짜+시간
  - `end`: 날짜+시간
  - `location`: 문자열
  - `isCompleted`: boolean  
    - `true`일 경우 캘린더에서 **취소선**으로 표시

---

## 1.2 Task(작업)

- **사용 위치**: 칸반보드(Kanban), Gantt 차트  

- **필드**
  - `title`: 문자열 (필수)
  - `description`: 문자열 (선택)
  - `startDate`: 날짜
  - `endDate`: 날짜
  - `status`: `enum(todo, progress, done)`
  - `parentTaskId`: 상위 태스크 ID (없으면 `null` = parent task)

- **용어**
  - **parent task**: `parentTaskId == null` 인 태스크  
  - **subtask**: `parentTaskId != null` 인 태스크  

> **중요**: 캘린더의 `schedule`과 칸반/간트의 `task`는 서로 다른 개념이다.  
> 단, 캘린더에서 특정 기능을 이용할 때 `task`를 새로 생성할 수 있다.

---

# 2. 회원 & 로그인 플로우

1. 사용자는 **e-campus ID/PW** 기반으로 회원가입한다.
   - e-campus ID/PW로 유효성을 확인한다.
   - 서비스 내부용 `id/pw`와 `이름`을 별도로 저장한다.
2. 로그인 후 **메인 화면**으로 이동한다.
   - 메인 화면에는 **캘린더**가 표시된다.
3. 사용자는 **마이페이지**에서 Google 로그인을 진행할 수 있다.
   - OAuth로 연동한다.
4. Google 연동을 완료하고 메인 캘린더로 돌아오면:
   - e-campus에서 가져온 **과제 일정**이 마감 기한에 맞춰 `schedule`로 표시된다.
   - 제출 완료된 과제는 `isCompleted = true`로 간주하고, 캘린더에서 **취소선**으로 표시한다.
   - Google Calendar에서 가져온 일정도 함께 표시하여, 여러 일정 소스를 **한 곳에서** 볼 수 있다.

---

# 3. Task–Kanban–Gantt 동기화 규칙

## 3.1 Gantt 차트에서 Task 생성 규칙

### 상황 1: Gantt에서 parent task만 생성한 경우

- **조건**
  - Gantt 차트에서 `parent task`를 생성한다.
  - 이 `parent task`는 아직 `subtask`가 없다.

- **결과**
  - Gantt에 `parent task` 생성
  - 칸반보드의 `todo` 컬럼에 **같은 parent task** 생성

---

### 상황 2: Gantt에서 subtask를 생성한 경우

- **조건**
  - Gantt 차트에서 어떤 `parent task`에 `subtask`를 생성한다.

- **결과**
  - Gantt에 `subtask` 생성
  - 칸반보드 `todo` 컬럼:
    - 해당 `parent task`가 `todo`에 있었다면 **parent task를 제거**
    - 새로 생성된 **모든 subtask**를 `todo` 상태로 추가

**정리**

- Gantt에서 작업 생성 시  
  - “subtask 없는 parent task” → Kanban `todo`에 parent task 1개  
  - “subtask를 가진 parent task” → Kanban `todo`에는 parent는 제거, 대신 **모든 subtask가 `todo`**

---

## 3.2 칸반보드에서 Task 생성 규칙

- **조건**
  - 칸반보드에서 새로운 작업을 생성한다.
  - 칸반보드에서는 **parent task만 생성 가능**하다. (subtask 직접 생성 X)

- **결과**
  - 칸반보드 `todo` 컬럼에 **parent task** 생성
  - Gantt 차트에도 **subtask가 없는 parent task**를 동일하게 생성

**즉,**

- **Kanban → Gantt**: parent task 동시 생성  
- **Gantt → Kanban**: parent / subtask 상태에 따라 `todo`에 동기화

---

## 3.3 Task 상태 변경과 Done 동기화

### 상황 1: 칸반보드에서 상태 변경

- **조건**
  - 사용자가 칸반보드에서 task를  
    `todo → progress` 또는 `progress → done` 으로 이동한다.

- **결과**
  - 해당 task의 `status` 값을 변경한다.
  - `status == done`이 된 task는:
    - Gantt 차트에서 **취소선**으로 표시한다.

---

### 상황 2: Gantt 차트에서 완료 처리

- **조건**
  - Gantt 차트에서 어떤 task를 “완료(done)” 상태로 지정한다.

- **결과**
  - 해당 task의 `status`를 `done`으로 변경
  - Gantt 차트에서는 해당 task를 **취소선**으로 표시
  - 칸반보드에서도 이 task를 `done` 컬럼으로 이동

---

# 4. 캘린더 Schedule → Task 생성 규칙

## 4.1 Schedule과 Task의 구분

- `schedule`은 캘린더에 표시되는 **시간 기반 일정** (날짜+시간)
- `task`는 할 일/작업 단위로, **칸반보드/Gantt**에서 관리
- 서로 다른 엔티티이지만, 일정에서 **“task에 추가”** 기능을 통해 연결될 수 있음

---

## 4.2 “task에 추가” 버튼 동작

- **조건**
  - 사용자가 캘린더에서 특정 `schedule`에 대해 **“task에 추가”** 버튼을 누른다.

- **결과**
  - 새로운 **parent task**를 생성한다.
  - 이 task는 **칸반보드와 Gantt 차트에 동시에 생성**된다.
  - 생성되는 task의 필드는 다음과 같이 매핑한다.
    - `title` = schedule의 `title`
    - `description` = schedule의 `description`
    - `startDate` = 오늘 날짜(현재 날짜)
    - `endDate` = 해당 schedule의 날짜 (필요 시 schedule의 `end` 기준)
    - `status` = `todo`
    - `parentTaskId` = `null` (parent task)

---

# 5. 친구 및 그룹 기능

## 5.1 친구 기능

- 사용자 A는 **상대방의 ID**로 친구 추가를 할 수 있다.
- 친구 추가에 성공하면:
  - A의 **친구 목록**에 해당 사용자가 표시된다.
- 친구 목록을 통해 자신이 추가한 친구들을 확인할 수 있다.

---

## 5.2 그룹(Group) 기능

- **목적**: 프로젝트, 조별 과제, 스터디 등 **공동 일정 관리**

- **그룹 생성 규칙**
  - 사용자는 **이미 친구로 추가된 사용자들만** 그룹 멤버로 선택할 수 있다.
  - 선택한 친구들 + 자신을 포함하여 그룹을 생성한다.

---

# 6. 그룹 탭 내 일정 기능

그룹 탭에는 두 가지 일정 기능이 있다.

1. **일정 추가**
2. **일정 조율**

---

## 6.1 일정 추가

- **의미**: 그룹원들끼리 **이미 합의가 끝난 일정**을 등록하는 기능

- **입력 항목**
  - `title`: 일정 제목
  - `description`: 내용 (선택)
  - `location`: 장소 (선택)
  - `start`: 시작 일시 (날짜+시간)
  - `end`: 종료 일시 (날짜+시간)
  - `members`: 참여 멤버 목록

- **결과**
  - 선택된 멤버 각각의 캘린더에 이 일정이 `schedule`로 생성된다.
  - 각 멤버에게 **알림(Notification)**을 발송한다.
  - 그룹 탭에서도 해당 일정을 조회할 수 있으며,  
    어떤 멤버들이 참여하는지 확인 가능하다.

---

## 6.2 일정 조율

### 6.2.1 입력 단계

- 사용자는 다음 정보를 선택한다.
  - `members`: 참여 대상 멤버들
  - `period`: 일정 후보 기간 (예: `2025-11-20 ~ 2025-11-30`)

---

### 6.2.2 표시 규칙

- 선택한 `period` 동안, 각 멤버의 일정 정보를 바탕으로 그룹 조율 화면에 시간대를 표시한다.

- **프라이버시 규칙**
  - **다른 사람의 일정**
    - 해당 시간대를 **회색 블록**으로만 표시
    - 일정의 제목/내용 등 구체 정보는 표시하지 않는다.
  - **내 일정**
    - 나의 캘린더 일정은 회색 블록 +  
      그 시간에 어떤 일정이 있는지 **제목**을 함께 표시한다.

> 목적: 남의 일정 내용은 보호하면서, 본인은 자신의 일정 내용을 보며 일정을 잡을 수 있게 한다.

---

### 6.2.3 시간 선택 및 일정 생성

- 사용자는 조율 화면에서 **회색이 아닌 빈 시간대**를 선택한다.

- **조건**
  - 빈 시간대를 선택한 후 “다음” 또는 유사 버튼을 눌러 **일정 추가 화면으로 이동**한다.

- **결과 (일정 추가 화면 초기값)**
  - `start`, `end`: 방금 사용자가 선택한 시간
  - `members`: 조율에 선택했던 멤버들

- 사용자는 `title`, `description`, `location` 등을 입력/수정 후 일정을 생성한다.

- **일정 생성 결과**
  - 선택된 멤버들의 캘린더에 모두 `schedule`로 등록된다.
  - 각 멤버에게 알림이 발송된다.
  - 그룹 탭에서도 해당 일정을 확인할 수 있고,  
    참여 멤버 목록을 볼 수 있다.
