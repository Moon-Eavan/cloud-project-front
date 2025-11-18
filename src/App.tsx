import { useState, useEffect } from 'react';
import { Calendar, Users, UserPlus, Menu, User as UserIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Toaster } from 'sonner';

import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import FriendPage from './features/friends/FriendPage';
import GroupPage from './features/group/GroupPage';
import { ImageWithFallback } from './components/common/ImageWithFallback';
import { MiniCalendar } from './components/common/MiniCalendar';
import LoginDialog from './components/auth/LoginDialog';

import { TaskProvider, useTaskContext } from './store/TaskContext';
import { ScheduleProvider, useScheduleContext } from './store/ScheduleContext';
import { AuthProvider, useAuth } from './store/AuthContext';

type Page = 'dashboard' | 'mypage' | 'groups' | 'friends';

function DataLoader({ children }: { children: React.ReactNode }) {
  const { loadTasks } = useTaskContext();
  const { loadSchedules } = useScheduleContext();

  useEffect(() => {
    loadTasks();
    loadSchedules();
  }, [loadTasks, loadSchedules]);

  return <>{children}</>;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { id: 'dashboard' as Page, label: '일정', icon: Calendar },
    { id: 'groups' as Page, label: '그룹', icon: Users },
    { id: 'friends' as Page, label: '친구', icon: UserPlus },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'mypage':
        return <MyPage />;
      case 'groups':
        return <GroupPage />;
      case 'friends':
        return <FriendPage />;
      default:
        return <Dashboard />;
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

      <div className="flex-1"></div>

      <div className="px-4 pb-4">
        <MiniCalendar />
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => {
            if (isAuthenticated) {
            setCurrentPage('mypage');
            setMobileMenuOpen(false);
            } else {
              setLoginDialogOpen(true);
              setMobileMenuOpen(false);
            }
          }}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isAuthenticated && user?.profileImage ? (
          <ImageWithFallback
              src={user.profileImage}
              alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-900 truncate w-full">{user.name}</span>
                <span className="text-xs text-gray-500 truncate w-full">{user.email}</span>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-900 truncate w-full">Guest</span>
                <span className="text-xs text-gray-500 truncate w-full">로그인이 필요합니다</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <aside className="hidden md:block w-64 border-r border-slate-200">
        <SidebarContent />
      </aside>

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

      <main className="flex-1 overflow-auto">
        <div className="md:pt-0 pt-16">
          {renderPage()}
        </div>
      </main>

      {!isAuthenticated && (
        <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <TaskProvider>
      <ScheduleProvider>
        <DataLoader>
          <AppContent />
          <Toaster position="top-right" />
        </DataLoader>
      </ScheduleProvider>
    </TaskProvider>
    </AuthProvider>
  );
}