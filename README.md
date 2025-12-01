# Calendar & Task Management Application

A modern, full-featured calendar and task management application built with React, TypeScript, and Vite. This application follows the specifications outlined in [spec.md](spec.md).

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The application will be available at **http://localhost:3000**

## 📋 Features

### Authentication
- ✅ Email/password based signup and login
- ✅ Form validation with real-time feedback
- ✅ Session management
- ✅ Protected routes

### Calendar Management
- ✅ **Three Calendar Types**:
  - **Google Calendar**: OAuth-integrated (UI ready for backend)
  - **Calendar** (local): Service-managed calendar
  - **E-Campus**: Read-only, token-based sync (UI ready for backend)
- ✅ Sidebar with visibility toggles for each calendar
- ✅ Month view with color-coded schedules
- ✅ Create, edit, delete schedules (except E-Campus)
- ✅ Convert schedules to tasks
- ✅ Completed schedules show with strikethrough

### Task Management
- ✅ **Kanban Board**: Three columns (To Do, In Progress, Done)
- ✅ **Gantt Chart**: Timeline view with parent/subtask hierarchy
- ✅ **Sync Rules** (per spec.md section 3):
  - Parent tasks without subtasks appear in Kanban
  - When subtasks are created, parent is removed from Kanban and all subtasks appear
  - Kanban can only create parent tasks
  - Status changes sync between Kanban and Gantt
- ✅ Done tasks show with strikethrough in Gantt

### Friends & Groups
- ✅ Add friends by ID/email
- ✅ Friend request system
- ✅ Create groups (only with existing friends)
- ✅ Group schedule coordination (When2Meet style)
- ✅ Privacy-preserved schedule viewing (others' schedules show as gray blocks)

### Notifications
- ✅ Notification panel at bottom-left
- ✅ Friend request notifications
- ✅ Group schedule notifications
- ✅ Mark as read functionality
- ✅ Unread count badge

### My Page
- ✅ Profile management
- ✅ Google Calendar integration (UI ready)
- ✅ E-Campus token integration (UI ready)
- ✅ Password change
- ✅ Account settings

## 🏗️ Project Structure

```
Calendar/
├── src/
│   ├── api/                    # API layer (backend integrated)
│   │   ├── client.ts           # Axios client with JWT auth
│   │   ├── authApi.ts          # ✅ Backend integrated
│   │   ├── calendarsApi.ts     # ✅ Backend integrated
│   │   ├── schedulesApi.ts     # ✅ Backend integrated
│   │   ├── tasksApi.ts         # ✅ Backend integrated
│   │   ├── friendsApi.ts
│   │   ├── groupsApi.ts
│   │   └── notificationsApi.ts
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── common/             # Shared components
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/
│   │   ├── calendar/
│   │   │   └── components/
│   │   │       └── MonthView.tsx
│   │   ├── tasks/
│   │   │   └── components/
│   │   │       ├── KanbanBoard.tsx
│   │   │       └── GanttChart.tsx
│   │   ├── friends/
│   │   ├── groups/
│   │   └── notifications/
│   │       └── components/
│   │           └── NotificationPanel.tsx
│   │
│   ├── pages/                  # Top-level pages
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── FriendsPage.tsx
│   │   └── GroupsPage.tsx
│   │
│   ├── mocks/                  # Mock data & in-memory storage
│   │   ├── mockStore.ts
│   │   └── mockData.ts
│   │
│   ├── lib/                    # Utilities
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── syncRules.ts        # Task-Kanban-Gantt sync logic
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── spec.md                     # Application specification
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Technology Stack

- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 6.3
- **Routing**: React Router DOM v7
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Utilities**: date-fns
- **HTTP Client**: axios (ready for backend integration)

## 🎯 Current Implementation Status

### ✅ Completed - Core Features
- Project setup and configuration
- Complete folder structure
- TypeScript type definitions (matching spec.md)
- All core features implemented and working:
  - Authentication (login/signup)
  - Calendar with 3 calendar types
  - Schedule management
  - Task management (Kanban + Gantt)
  - Friends management
  - Groups management
  - Notifications
  - My Page

### ✅ Backend Integration Completed

**Integrated APIs:**
1. **Authentication API** (`authApi.ts`)
   - JWT-based login/signup
   - Token management in localStorage
   - Auto token refresh on page load

2. **Categories API** (`calendarsApi.ts`)
   - Backend: `/api/v1/categories`
   - Create/read calendars
   - Auto-create default calendar on first login
   - Maps to frontend Calendar type

3. **Schedules API** (`schedulesApi.ts`)
   - Backend: `/api/v1/schedules`
   - Full CRUD operations
   - Status updates
   - Timezone handling (ISO 8601)

4. **Todos API** (`tasksApi.ts`)
   - Backend: `/api/v1/todos`
   - Parent/subtask hierarchy
   - Status mapping (TODO/IN_PROGRESS/DONE ↔ todo/progress/done)
   - Priority support (LOW/MEDIUM/HIGH/URGENT)
   - Auto category assignment

**Implementation Details:**
```typescript
// Example: tasksApi.ts
async createTaskFromKanban(taskData: Omit<Task, 'id' | 'parentTaskId'>): Promise<Task> {
  // Fetch user's categories
  const categoriesResponse = await apiClient.get('/v1/categories');
  const defaultCategoryId = categoriesResponse.data[0].categoryId;

  const requestBody = {
    title: taskData.title,
    description: taskData.description || null,
    startDate: formatDateToString(taskData.startDate),
    dueDate: formatDateToString(taskData.endDate),
    status: 'TODO',
    categoryId: defaultCategoryId,
    scheduleId: null,
    priority: 'MEDIUM',
  };

  const response = await apiClient.post<TodoResponse>('/v1/todos', requestBody);
  return mapTodoResponseToTask(response.data);
}
```

### 🔄 Pending Backend Integration

1. **Friends API** (UI ready)
   - Friend requests
   - Friend list management

2. **Groups API** (UI ready)
   - Group creation
   - Member management
   - Group schedules

3. **Notifications API** (UI ready)
   - Real-time notifications
   - Mark as read

4. **Google Calendar OAuth** (UI ready)
   - OAuth flow
   - Bidirectional sync

5. **E-Campus Integration** (UI ready)
   - Token validation
   - Canvas assignments sync

## 🧪 Testing

### Backend Testing

**Prerequisites:**
- Backend services running on `localhost:8080` (API Gateway)
- Docker services (MySQL, LocalStack) running

**Test Flows:**

1. **Signup & Login** (Real Backend)
   - Create account with email/password
   - JWT token stored in localStorage
   - Auto-redirect to dashboard

2. **Calendar Management** (Real Backend)
   - First login auto-creates default calendar
   - Create/edit/delete schedules
   - Schedules persist across page refreshes
   - Toggle calendar visibility

3. **Task Management** (Real Backend)
   - Create tasks in Kanban board
   - Tasks persist and sync with backend
   - Move tasks between columns (todo/progress/done)
   - View tasks in Gantt chart
   - Create subtasks in Gantt
   - Status changes sync between Kanban and Gantt

4. **Data Persistence** (✅ Working)
   - All data fetched from backend on login
   - Create/update/delete operations sync with backend
   - Page refresh maintains all data

### Known Limitations

- **Friends/Groups**: UI ready, backend integration pending
- **Notifications**: UI ready, backend integration pending
- **Google Calendar**: UI ready, OAuth flow pending
- **E-Campus Sync**: UI ready, Canvas integration pending

## 📚 Key Implementation Details

### Task-Kanban-Gantt Sync Rules

The application implements the sync rules from spec.md section 3:

```typescript
// From lib/syncRules.ts
export function getKanbanTasks(allTasks: Task[]): Task[] {
  return allTasks.filter((task) => {
    if (task.parentTaskId) return true; // Show all subtasks
    const hasSubtasks = allTasks.some((t) => t.parentTaskId === task.id);
    return !hasSubtasks; // Show parent only if no subtasks
  });
}
```

### Calendar Visibility

Calendars can be toggled on/off in the sidebar. Only visible calendars' schedules are rendered:

```typescript
const filteredSchedules = schedules.filter(schedule => {
  const calendar = calendars.find(c => c.id === schedule.calendarId);
  return calendar?.isVisible;
});
```

### Schedule to Task Conversion

Per spec.md section 4.2, converting a schedule to task:
- Creates a new parent task
- `startDate` = today
- `endDate` = schedule's end date
- `status` = 'todo'
- Appears in both Kanban and Gantt

## 🎨 Design System

### Colors

- **Google Calendar**: `#2c7fff` (Blue)
- **Local Calendar**: `#84cc16` (Green)
- **E-Campus**: `#a855f7` (Purple)
- **Task Status**:
  - To Do: Gray
  - In Progress: Blue
  - Done: Green

### Typography

- Korean font support
- System font stack with fallbacks
- Responsive text sizing

## 📱 Responsive Design

- Desktop-first approach
- Mobile navigation drawer
- Responsive grid layouts
- Touch-friendly UI elements

## 🔐 Security Considerations

**Current (Mock) Implementation:**
- Passwords are not validated (for development)
- No actual password hashing
- Mock token generation

**For Production:**
- Implement proper password hashing (bcrypt)
- Use secure JWT tokens
- HTTPS only
- CSRF protection
- Rate limiting on API endpoints

## 🚢 Deployment Checklist

### Backend Integration
- [x] Replace auth API with real backend (JWT)
- [x] Replace calendars API with categories endpoint
- [x] Replace schedules API with backend
- [x] Replace tasks API with todos endpoint
- [x] Implement auto-create default calendar
- [ ] Integrate friends API
- [ ] Integrate groups API
- [ ] Integrate notifications API
- [ ] Implement Google Calendar OAuth
- [ ] Implement Canvas/E-Campus sync

### Production Ready
- [x] Environment variables for API URLs
- [x] JWT authentication with token refresh
- [x] Error handling in API layer
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Add comprehensive loading states
- [ ] Add error boundaries
- [ ] Add analytics
- [ ] Optimize bundle size
- [ ] Add service worker for PWA
- [ ] Set up CI/CD pipeline

## 📄 License

Private project

## 👥 Credits

Built following the specifications in [spec.md](spec.md)
