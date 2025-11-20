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
│   ├── api/                    # API layer (mock implementations)
│   │   ├── authApi.ts
│   │   ├── calendarsApi.ts
│   │   ├── schedulesApi.ts
│   │   ├── tasksApi.ts
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

### ✅ Completed
- Project setup and configuration
- Complete folder structure
- TypeScript type definitions (matching spec.md)
- API layer with mock implementations
- All core features migrated and working:
  - Authentication (login/signup)
  - Calendar with 3 calendar types
  - Schedule management
  - Task management (Kanban + Gantt)
  - Friends management
  - Groups management
  - Notifications
  - My Page

### 🔄 Ready for Backend Integration

All API functions are marked with `// TODO: Replace with axios` comments. The mock implementations follow the same interface that will be used with the real backend:

```typescript
// Example from authApi.ts
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(500);  // Simulated network delay

  // TODO: Replace with:
  // const response = await axios.post('/api/auth/login', credentials);
  // return response.data;

  // ... mock implementation
}
```

### 📝 Integration TODOs

1. **Backend API Integration**:
   - Replace mock API functions with real axios calls
   - Update API endpoints
   - Handle authentication tokens
   - Implement error handling

2. **Google Calendar OAuth**:
   - Implement OAuth flow
   - Sync schedules bidirectionally
   - Handle token refresh

3. **E-Campus Integration**:
   - Implement token validation
   - Fetch assignments via API
   - Sync to calendar

4. **Real-time Features**:
   - WebSocket for notifications
   - Live schedule updates
   - Collaborative group scheduling

## 🧪 Testing

### Mock Data
The application comes with pre-populated mock data for testing:

- **User**: 김민수 (minsu@example.com)
- **Calendars**: Google Calendar, Calendar (local), E-Campus
- **Schedules**: Sample events in all three calendars
- **Tasks**: 3 sample tasks in different states
- **Friends**: 3 friends with accepted status
- **Groups**: 2 groups (team project, study group)
- **Notifications**: Sample friend request and group schedule notifications

### Test Flows

1. **Login**: Use any email (user will be created if doesn't exist)
2. **Calendar**: View schedules, toggle calendar visibility, add/edit schedules
3. **Tasks**: Create tasks in Kanban, move between columns, view in Gantt
4. **Friends**: Add friends, view friend list
5. **Groups**: Create groups, view group schedules
6. **Notifications**: Check notification panel at bottom-left

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

- [ ] Replace all mock API calls with real backend endpoints
- [ ] Implement proper authentication with JWT
- [ ] Add environment variables for API URLs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Add loading states and error boundaries
- [ ] Implement proper form validation
- [ ] Add analytics
- [ ] Optimize bundle size
- [ ] Add service worker for PWA
- [ ] Set up CI/CD pipeline

## 📄 License

Private project

## 👥 Credits

Built following the specifications in [spec.md](spec.md)
