import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '새로운 일정',
    message: '내일 팀 미팅이 예정되어 있습니다.',
    time: '5분 전',
    read: false,
    type: 'info',
  },
  {
    id: '3',
    title: '마감 임박',
    message: '프로젝트 마감까지 3일 남았습니다.',
    time: '2시간 전',
    read: true,
    type: 'warning',
  },
  {
    id: '4',
    title: '친구 요청',
    message: '홍길동님이 친구 요청을 보냈습니다.',
    time: '1일 전',
    read: true,
    type: 'info',
  },
];

export default function NotificationPanel() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-lg hover:bg-gray-100"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900">알림</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {mockNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getTypeColor(notification.type)} flex items-center justify-center`}>
                      {notification.type === 'success' ? (
                        <Check className="w-5 h-5" />
                      ) : notification.type === 'warning' ? (
                        <Bell className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm text-gray-900">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
