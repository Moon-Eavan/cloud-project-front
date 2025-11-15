import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, ListTodo } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  completed?: boolean;
  location?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'inProgress' | 'done';
  parentTaskId?: string;
}

const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '팀 미팅',
    description: '주간 팀 미팅',
    date: new Date(2025, 10, 5),
    startTime: '14:00',
    endTime: '15:00',
    color: 'blue',
  },
  {
    id: '2',
    title: '프로젝트 마감',
    description: '1차 프로젝트 마감',
    date: new Date(2025, 10, 15),
    color: 'red',
  },
  {
    id: '3',
    title: '점심 약속',
    description: '클라이언트 미팅',
    date: new Date(2025, 10, 12),
    startTime: '12:30',
    endTime: '14:00',
    color: 'green',
  },
];

const colorOptions = [
  { value: 'blue', label: '파란색', bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-100', border: 'border-blue-200' },
  { value: 'red', label: '빨간색', bg: 'bg-red-500', text: 'text-red-700', bgLight: 'bg-red-100', border: 'border-red-200' },
  { value: 'green', label: '초록색', bg: 'bg-green-500', text: 'text-green-700', bgLight: 'bg-green-100', border: 'border-green-200' },
  { value: 'purple', label: '보라색', bg: 'bg-purple-500', text: 'text-purple-700', bgLight: 'bg-purple-100', border: 'border-purple-200' },
  { value: 'orange', label: '주황색', bg: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-100', border: 'border-orange-200' },
  { value: 'pink', label: '분홍색', bg: 'bg-pink-500', text: 'text-pink-700', bgLight: 'bg-pink-100', border: 'border-pink-200' },
];

interface MonthCalendarProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function MonthCalendar({ events, setEvents, tasks, setTasks }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 현재 시간의 정각을 반환 (예: 14:35 -> 14:00)
  const getCurrentHour = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  };
  
  // 현재 시간 + 2시간을 반환
  const getCurrentHourPlus2 = () => {
    const now = new Date();
    const hours = (now.getHours() + 2).toString().padStart(2, '0');
    return `${hours}:00`;
  };
  
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    startDate: getTodayDate(),
    endDate: getTodayDate(),
    startTime: getCurrentHour(), 
    endTime: getCurrentHourPlus2(), 
    color: 'blue',
    location: ''
  });

  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.startDate) {
      if (editingEvent) {
        // 편집 모드: 기존 이벤트 업데이트
        setEvents(events.map(event => 
          event.id === editingEvent.id
            ? {
                ...event,
                title: newEvent.title,
                description: newEvent.description,
                date: new Date(newEvent.startDate),
                startTime: newEvent.startTime || undefined,
                endTime: newEvent.endTime || undefined,
                color: newEvent.color,
                completed: newEvent.completed,
                location: newEvent.location
              }
            : event
        ));
        setEditingEvent(null);
      } else {
        // 추가 모드: 새 이벤트 생성
        setEvents([
          ...events,
          {
            id: Date.now().toString(),
            title: newEvent.title,
            description: newEvent.description,
            date: new Date(newEvent.startDate),
            startTime: newEvent.startTime || undefined,
            endTime: newEvent.endTime || undefined,
            color: newEvent.color,
            completed: newEvent.completed,
            location: newEvent.location
          },
        ]);
      }
      setNewEvent({ 
        title: '', 
        description: '', 
        startDate: getTodayDate(),
        endDate: getTodayDate(),
        startTime: getCurrentHour(), 
        endTime: getCurrentHourPlus2(), 
        color: 'blue' 
      });
      setIsDialogOpen(false);
    }
  };
  
  // 다이얼로그가 열릴 때 날짜와 시간을 최신으로 업데이트
  const handleOpenDialog = (date?: Date) => {
    setEditingEvent(null);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setSelectedDate(date);
      setNewEvent({
        title: '',
        description: '',
        startDate: dateStr,
        endDate: dateStr,
        startTime: getCurrentHour(),
        endTime: getCurrentHourPlus2(),
        color: 'blue',
        location: ''
      });
    } else {
      setSelectedDate(new Date());
      setNewEvent({
        title: '',
        description: '',
        startDate: getTodayDate(),
        endDate: getTodayDate(),
        startTime: getCurrentHour(),
        endTime: getCurrentHourPlus2(),
        color: 'blue',
        location: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    const year = event.date.getFullYear();
    const month = String(event.date.getMonth() + 1).padStart(2, '0');
    const day = String(event.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      startDate: dateStr,
      endDate: dateStr,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      color: event.color,
      completed: event.completed || false,
      location: event.location || ''
    });
    setIsDialogOpen(true);
  };

  const getEventsForDate = (day: number) => {
    return events.filter((event) => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    }).sort((a, b) => {
      // Sort events: timed events first, then all-day events
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(c => c.value === color);
    return colorOption || colorOptions[0];
  };

  const handleAddToTodo = (event: CalendarEvent) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: event.title,
      description: event.description,
      startDate: event.date,
      endDate: event.date,
      status: 'todo'
    };
    setTasks([...tasks, newTask]);
    toast.success(`"${event.title}" 일정이 TODO에 추가되었습니다.`);
  };

  const renderCalendarDays = () => {
    const days = [];
    // Calculate if we need 6 weeks or 5 weeks
    const totalCells = (firstDayOfMonth + daysInMonth > 35) ? 42 : 35;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const dayEvents = isCurrentMonth ? getEventsForDate(dayNumber) : [];
      const isTodayCell = isCurrentMonth && isToday(dayNumber);

      days.push(
        <div
          key={i}
          className={`min-h-32 border-r border-b border-gray-200 p-1 transition-all relative ${
            isCurrentMonth ? 'bg-white cursor-pointer hover:bg-gray-50' : 'bg-gray-50/50'
          }`}
          onClick={() => {
            if (isCurrentMonth) {
              handleOpenDialog(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber));
            }
          }}
        >
          {isCurrentMonth && (
            <>
              <div className="flex justify-start mb-1 px-1">
                {isTodayCell ? (
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                    {dayNumber}
                  </div>
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center text-sm text-gray-700">
                    {dayNumber}
                  </div>
                )}
              </div>
              <div className="space-y-0.5 px-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const colorClass = getColorClass(event.color);
                  return (
                    <ContextMenu key={event.id}>
                      <ContextMenuTrigger>
                        <div
                          className="flex items-center gap-1.5 group cursor-pointer hover:opacity-80"
                          title={`${event.title}${event.startTime ? ` (${event.startTime})` : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          <div className={`w-1 h-4 rounded-full ${colorClass.bg} flex-shrink-0`}></div>
                          <div className={`text-xs truncate flex-1 ${event.completed ? 'line-through opacity-50 text-gray-500' : 'text-gray-700'}`}>
                            {event.startTime && (
                              <span className="text-gray-500">{event.startTime} </span>
                            )}
                            <span>{event.title}</span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToTodo(event);
                          }}
                        >
                          <ListTodo className="w-4 h-4 mr-2" />
                          TODO에 추가
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          편집
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-1.5 py-0.5">
                    +{dayEvents.length - 3} 더보기
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={goToToday}
            className="rounded-lg border-gray-300 hover:bg-gray-100"
          >
            오늘
          </Button>
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="min-w-32 text-center text-gray-900">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-blue-500 hover:bg-blue-600 gap-2"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? '일정 편집' : '일정 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? '일정을 수정합니다.' : '새로운 일정을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">제목</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">시작일</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">종료일</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time">시작 시간</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">종료 시간</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-color">색상</Label>
              <Select value={newEvent.color} onValueChange={(value) => setNewEvent({ ...newEvent, color: value })}>
                <SelectTrigger id="event-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${option.bg}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event-description">설명 (선택)</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="일정 설명을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="event-location">장소 (선택)</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="장소를 입력하세요"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="event-completed"
                checked={newEvent.completed}
                onCheckedChange={(checked) => setNewEvent({ ...newEvent, completed: !!checked })}
              />
              <Label htmlFor="event-completed" className="cursor-pointer">완료됨</Label>
            </div>

            <Button onClick={handleAddEvent} className="w-full bg-blue-500 hover:bg-blue-600">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b border-gray-300 bg-white">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div 
              key={day} 
              className={`text-center py-3 border-r border-gray-200 last:border-r-0 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}