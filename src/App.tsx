import { useState } from 'react';
import { Calendar as CalendarIcon, Users, UserPlus, Menu, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Checkbox } from './components/ui/checkbox';
import { ImageWithFallback } from './components/common/ImageWithFallback';
import { MiniCalendar } from './components/common/MiniCalendar';
import LoginDialog from './components/common/LoginDialog';
import NotificationPanel from './components/common/NotificationPanel';

// Pages
import DashboardPage from './pages/DashboardPage';
import MyPage from './pages/MyPage';
import GroupsPage from './pages/GroupsPage';
import FriendsPage from './pages/FriendsPage';

// Types
import type {
  Schedule,
  Task,
  Calendar,
  CalendarType
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
  { id: '1', title: '프로젝트 기획서 작성', description: '프로젝트 초기 기획서 작성', startDate: new Date(2025, 10, 1), endDate: new Date(2025, 10, 5), status: 'todo' },
  { id: '2', title: 'UI 디자인', description: '메인 화면 디자인', startDate: new Date(2025, 10, 6), endDate: new Date(2025, 10, 10), status: 'progress' },
  { id: '3', title: '데이터베이스 설계', description: 'ERD 작성', startDate: new Date(2025, 10, 11), endDate: new Date(2025, 10, 15), status: 'done' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>(initialCalendars);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const addSchedule = (schedule: Schedule) => {
    setSchedules((prev) => [...prev, schedule]);
  };

  const toggleCalendarVisibility = (calendarId: string) => {
    setCalendars(prev =>
      prev.map(cal =>
        cal.id === calendarId ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
  };

  const handleLogout = () => {
    alert('로그아웃되었습니다.');
    setIsLoggedIn(false);
    setUser(null);
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
        return <MyPage onLogout={handleLogout} />;
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
        <h1 className="text-xl text-gray-900">Calendar</h1>
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
        <div className="space-y-1">
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
              <span className="text-sm text-gray-700">{calendar.name}</span>
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
            onClick={() => {
              if (isLoggedIn) {
                setCurrentPage('mypage');
                setMobileMenuOpen(false);
              } else {
                setLoginDialogOpen(true);
                setMobileMenuOpen(false);
              }
            }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-1 min-w-0"
          >
            {isLoggedIn ? (
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI2NjMxMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="User"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-900 truncate w-full">{user?.name || 'User'}</span>
                  <span className="text-[10px] text-gray-500 truncate w-full">{user?.email || 'cloud@khu.ac.kr'}</span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-900 truncate w-full">Guest</span>
                  <span className="text-[10px] text-gray-500 truncate w-full">로그인이 필요합니다</span>
                </>
              )}
            </div>
          </button>
          <NotificationPanel />
        </div>
      </div>
    </div>
  );

  return (
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

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLogin={(name, email) => {
          setUser({ name, email });
          setIsLoggedIn(true);
          setLoginDialogOpen(false);
        }}
      />
    </div>
  );
}
