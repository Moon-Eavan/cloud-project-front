import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, UserPlus, Menu } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Checkbox } from './components/ui/checkbox';
import { ImageWithFallback } from './components/common/ImageWithFallback';
import { MiniCalendar } from './components/common/MiniCalendar';
import NotificationPanel from './features/notifications/components/NotificationPanel';
import { toast, Toaster } from 'sonner';

// Pages
import DashboardPage from './pages/DashboardPage';
import MyPage from './pages/MyPage';
import GroupsPage from './pages/GroupsPage';
import FriendsPage from './pages/FriendsPage';

// Components
import LoginDialog from './components/LoginDialog';

// API
import { authApi } from './api/authApi';
import { schedulesApi } from './api/schedulesApi';
import { calendarsApi } from './api/calendarsApi';
import { tasksApi } from './api/tasksApi';
import { enrollmentsApi } from './api/enrollmentsApi';

// Types
import type {
  Schedule,
  Task,
  Calendar,
  User,
} from './types';

type Page = 'dashboard' | 'mypage' | 'groups' | 'friends';

const initialCalendars: Calendar[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    type: 'google',
    color: '#2c7fff',
    isVisible: true,
  },
  {
    id: 'local-calendar',
    name: 'Calendar',
    type: 'local',
    color: '#84cc16',
    isVisible: true,
  },
  {
    id: 'ecampus-calendar',
    name: 'e-Campus',
    type: 'ecampus',
    color: '#a855f7',
    isVisible: true,
  },
];

const initialSchedules: Schedule[] = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 팀 미팅',
    start: new Date(2025, 10, 5, 14, 0),
    end: new Date(2025, 10, 5, 15, 0),
    isCompleted: false,
    calendarId: 'google-calendar',
  },
  {
    id: '2',
    title: '프로젝트 마감',
    description: '1차 프로젝트 마감',
    start: new Date(2025, 10, 15, 0, 0),
    end: new Date(2025, 10, 15, 23, 59),
    isCompleted: false,
    calendarId: 'local-calendar',
  },
  {
    id: '3',
    title: '점심 약속',
    description: '클라이언트 미팅',
    start: new Date(2025, 10, 12, 12, 30),
    end: new Date(2025, 10, 12, 14, 0),
    isCompleted: false,
    calendarId: 'local-calendar',
  },
  {
    id: '4',
    title: '웹프로그래밍 강의',
    description: '1주차 강의',
    start: new Date(2025, 10, 8, 10, 0),
    end: new Date(2025, 10, 8, 12, 0),
    isCompleted: false,
    calendarId: 'ecampus-calendar',
  },
  {
    id: '5',
    title: '데이터베이스 과제 제출',
    description: '2차 과제 마감',
    start: new Date(2025, 10, 20, 0, 0),
    end: new Date(2025, 10, 20, 23, 59),
    isCompleted: false,
    calendarId: 'ecampus-calendar',
  },
];

const initialTasks: Task[] = [
  { id: '1', title: '프로젝트 기획서 작성', description: '프로젝트 초기 기획서 작성', startDate: new Date(2025, 10, 1), endDate: new Date(2025, 10, 5), status: 'todo', parentTaskId: null },
  { id: '2', title: 'UI 디자인', description: '메인 화면 디자인', startDate: new Date(2025, 10, 6), endDate: new Date(2025, 10, 10), status: 'progress', parentTaskId: null },
  { id: '3', title: '데이터베이스 설계', description: 'ERD 작성', startDate: new Date(2025, 10, 11), endDate: new Date(2025, 10, 15), status: 'done', parentTaskId: null },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>(initialCalendars);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          // Parse stored user data which includes ecampusToken
          const storedUser = JSON.parse(userData);

          // Verify token is still valid
          const currentUser = await authApi.getCurrentUser();
          if (currentUser) {
            // Merge stored data (includes ecampusToken) with current user data
            setUser({
              ...currentUser,
              ecampusToken: storedUser.ecampusToken || currentUser.ecampusToken,
            });
            setIsLoggedIn(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Fetch calendars, schedules, and tasks when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn) {
        try {
          console.log('Fetching calendars, schedules, and tasks...');
          let fetchedCalendars = await calendarsApi.listCalendars();

          // If no calendars exist, create a default one
          if (!fetchedCalendars || fetchedCalendars.length === 0) {
            console.log('No calendars found. Creating default calendar...');
            const defaultCalendar = await calendarsApi.createCalendar({
              name: 'Calendar',
              color: '#84cc16',
            });
            fetchedCalendars = [defaultCalendar];
            toast.success('기본 캘린더가 생성되었습니다.');
          }

          const [fetchedSchedules, fetchedTasks] = await Promise.all([
            schedulesApi.listSchedules(),
            tasksApi.listTasks(),
          ]);

          console.log('Fetched calendars:', fetchedCalendars);
          console.log('Fetched schedules:', fetchedSchedules);
          console.log('Fetched tasks:', fetchedTasks);

          // Filter Canvas calendars based on enrollment status
          let filteredCalendars = fetchedCalendars;
          if (user?.ecampusToken) {
            try {
              const enrollments = await enrollmentsApi.listEnrollments();
              const enabledCourseIds = new Set(
                enrollments
                  .filter(e => e.isSyncEnabled)
                  .map(e => e.course.id.toString())
              );

              filteredCalendars = fetchedCalendars.filter(cal => {
                if (cal.type !== 'ecampus') return true;
                if (!cal.sourceId) return false;
                return enabledCourseIds.has(cal.sourceId);
              });

              console.log('[App] Initial load - filtered calendars:', filteredCalendars);
            } catch (error) {
              console.error('[App] Failed to filter calendars on initial load:', error);
            }
          }

          setCalendars(filteredCalendars);
          setSchedules(fetchedSchedules);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Failed to fetch calendars/schedules/tasks:', error);
          toast.error('데이터를 불러오는데 실패했습니다.');
        }
      }
    };

    fetchData();
  }, [isLoggedIn, user?.ecampusToken]);

  const toggleCalendarVisibility = (calendarId: string) => {
    setCalendars(prev =>
      prev.map(cal =>
        cal.id === calendarId ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsLoggedIn(false);
      setUser(null);
      setCurrentPage('dashboard');
      toast.success('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('로그아웃에 실패했습니다.');
    }
  };

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    setIsLoggedIn(true);
    setLoginDialogOpen(false);
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setCurrentPage('mypage');
      setMobileMenuOpen(false);
    } else {
      setLoginDialogOpen(true);
    }
  };

  // Refresh calendars and schedules (for Canvas sync)
  const refreshData = async () => {
    try {
      console.log('[App] Refreshing calendars and schedules...');
      const [fetchedCalendars, fetchedSchedules] = await Promise.all([
        calendarsApi.listCalendars(),
        schedulesApi.listSchedules(),
      ]);

      console.log('[App] Fetched calendars:', fetchedCalendars);
      console.log('[App] Fetched schedules:', fetchedSchedules);
      console.log('[App] Schedule count:', fetchedSchedules.length);

      // Filter Canvas calendars based on enrollment status
      let filteredCalendars = fetchedCalendars;

      // If user has Canvas token, fetch enrollments and filter calendars
      if (user?.ecampusToken) {
        try {
          const enrollments = await enrollmentsApi.listEnrollments();
          console.log('[App] Fetched enrollments:', enrollments);

          // Get enabled course IDs (these are course.id values from the Course table)
          const enabledCourseIds = new Set(
            enrollments
              .filter(e => e.isSyncEnabled)
              .map(e => e.course.id.toString())
          );

          console.log('[App] Enabled course IDs:', Array.from(enabledCourseIds));

          // Filter out Canvas calendars that don't have enabled enrollments
          filteredCalendars = fetchedCalendars.filter(cal => {
            // Keep non-Canvas calendars (local, google)
            if (cal.type !== 'ecampus') {
              return true;
            }

            // For Canvas calendars, match by sourceId (which stores course.id)
            // calendar.sourceId should equal course.id from enrollment
            if (!cal.sourceId) {
              console.log(`[App] Canvas calendar ${cal.name} has no sourceId, filtering out`);
              return false;
            }

            const isEnabled = enabledCourseIds.has(cal.sourceId);
            console.log(`[App] Canvas calendar ${cal.name} (sourceId: ${cal.sourceId}): ${isEnabled ? 'KEEP' : 'FILTER OUT'}`);
            return isEnabled;
          });

          console.log('[App] Filtered calendars:', filteredCalendars);
        } catch (error) {
          console.error('[App] Failed to fetch enrollments for filtering:', error);
          // If enrollment fetch fails, keep all calendars
        }
      }

      const canvasCalendars = filteredCalendars.filter(cal => cal.type === 'ecampus');
      if (canvasCalendars.length > 0) {
        console.log('[App] Canvas calendars after filtering:', canvasCalendars.length, canvasCalendars);
      } else {
        console.log('[App] No Canvas calendars after filtering');
      }

      setCalendars(filteredCalendars);
      setSchedules(fetchedSchedules);
      console.log('[App] Data refreshed successfully');
    } catch (error) {
      console.error('[App] Failed to refresh data:', error);
      toast.error('데이터 새로고침에 실패했습니다.');
    }
  };

  const navigationItems = [
    { id: 'dashboard' as Page, label: '일정', icon: CalendarIcon },
    { id: 'groups' as Page, label: '그룹', icon: Users },
    { id: 'friends' as Page, label: '친구', icon: UserPlus },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            calendars={calendars}
            schedules={schedules}
            setSchedules={setSchedules}
            tasks={tasks}
            setTasks={setTasks}
          />
        );
      case 'mypage':
        return <MyPage user={user} onLogout={handleLogout} onUserUpdate={setUser} onDataRefresh={refreshData} />;
      case 'groups':
        return <GroupsPage schedules={schedules} setSchedules={setSchedules} />;
      case 'friends':
        return <FriendsPage />;
      default:
        return (
          <DashboardPage
            calendars={calendars}
            schedules={schedules}
            setSchedules={setSchedules}
            tasks={tasks}
            setTasks={setTasks}
          />
        );
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl text-gray-900">UniSync</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Calendar Sources Section */}
      <div className="px-4 pb-4 border-b border-gray-200">
        <h3 className="text-xs text-gray-500 mb-2 px-2">캘린더</h3>
        <div className="space-y-1 max-h-[234px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {calendars.map((calendar) => (
            <label
              key={calendar.id}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              <div className="relative">
                <Checkbox
                  checked={calendar.isVisible}
                  onCheckedChange={() => toggleCalendarVisibility(calendar.id)}
                  style={{
                    backgroundColor: calendar.isVisible ? calendar.color : undefined,
                    borderColor: calendar.isVisible ? calendar.color : undefined,
                  }}
                />
              </div>
              <span className="text-sm text-gray-700 truncate">{calendar.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Mini Calendar */}
      <div className="px-4 pb-4">
        <MiniCalendar />
      </div>

      {/* Profile Section at Bottom */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-1 min-w-0"
          >
            {isLoggedIn && user?.profileImage ? (
              <ImageWithFallback
                src={user.profileImage}
                alt="User"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-lg">
                  {isLoggedIn && user?.name ? user.name.charAt(0) : '?'}
                </span>
              </div>
            )}
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              <span className="text-sm text-gray-900 truncate w-full">
                {isLoggedIn && user?.name ? user.name : '게스트'}
              </span>
              <span className="text-[10px] text-gray-500 truncate w-full">
                {isLoggedIn && user?.email ? user.email : '로그인이 필요합니다'}
              </span>
            </div>
          </button>
          <NotificationPanel />
        </div>
      </div>
    </div>
  );

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center px-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <h1 className="ml-4 text-gray-900">Calendar</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="md:pt-0 pt-16">
          {renderPage()}
        </div>
      </main>
      </div>
    </>
  );
}
