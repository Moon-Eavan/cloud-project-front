import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, ListTodo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { toast } from 'sonner';
import type { Schedule, Task, Calendar } from '@/types';

interface MonthCalendarProps {
  calendars: Calendar[];
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function MonthCalendar({ calendars, schedules, setSchedules, tasks, setTasks }: MonthCalendarProps) {
  // Filter schedules based on calendar visibility
  const filteredSchedules = schedules.filter(schedule => {
    const calendar = calendars.find(cal => cal.id === schedule.calendarId);
    return calendar?.isVisible ?? true;
  });

  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isMoreEventsDialogOpen, setIsMoreEventsDialogOpen] = useState(false);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState<Schedule[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(0);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);

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

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startDate: getTodayDate(),
    startTime: getCurrentHour(),
    endDate: getTodayDate(),
    endTime: getCurrentHourPlus2(),
    calendarId: 'local-calendar',
    location: '',
    isCompleted: false
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

  // Get calendar color by ID
  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.color || '#2c7fff';
  };

  const handleAddSchedule = () => {
    if (newSchedule.title.trim() && newSchedule.startDate) {
      const startDateTime = new Date(`${newSchedule.startDate}T${newSchedule.startTime || '00:00'}`);
      const endDateTime = new Date(`${newSchedule.endDate}T${newSchedule.endTime || '23:59'}`);

      if (editingSchedule) {
        // 편집 모드: 기존 스케줄 업데이트
        setSchedules(schedules.map(schedule =>
          schedule.id === editingSchedule.id
            ? {
                ...schedule,
                title: newSchedule.title,
                description: newSchedule.description,
                start: startDateTime,
                end: endDateTime,
                calendarId: newSchedule.calendarId,
                isCompleted: newSchedule.isCompleted,
                location: newSchedule.location
              }
            : schedule
        ));
        setEditingSchedule(null);
      } else {
        // 추가 모드: 새 스케줄 생성
        setSchedules([
          ...schedules,
          {
            id: Date.now().toString(),
            title: newSchedule.title,
            description: newSchedule.description,
            start: startDateTime,
            end: endDateTime,
            calendarId: newSchedule.calendarId,
            isCompleted: newSchedule.isCompleted,
            location: newSchedule.location
          },
        ]);
      }
      setNewSchedule({
        title: '',
        description: '',
        startDate: getTodayDate(),
        startTime: getCurrentHour(),
        endDate: getTodayDate(),
        endTime: getCurrentHourPlus2(),
        calendarId: 'local-calendar',
        location: '',
        isCompleted: false
      });
      setIsDialogOpen(false);
    }
  };

  // 다이얼로그가 열릴 때 날짜와 시간을 최신으로 업데이트
  const handleOpenDialog = (date?: Date) => {
    setEditingSchedule(null);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      setSelectedDate(date);
      setNewSchedule({
        title: '',
        description: '',
        startDate: dateStr,
        startTime: getCurrentHour(),
        endDate: dateStr,
        endTime: getCurrentHourPlus2(),
        calendarId: 'local-calendar',
        location: '',
        isCompleted: false
      });
    } else {
      setSelectedDate(new Date());
      setNewSchedule({
        title: '',
        description: '',
        startDate: getTodayDate(),
        startTime: getCurrentHour(),
        endDate: getTodayDate(),
        endTime: getCurrentHourPlus2(),
        calendarId: 'local-calendar',
        location: '',
        isCompleted: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    const startDate = new Date(schedule.start);
    const endDate = new Date(schedule.end);

    const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    setEditingSchedule(schedule);
    setNewSchedule({
      title: schedule.title,
      description: schedule.description,
      startDate: startDateStr,
      startTime: startTimeStr,
      endDate: endDateStr,
      endTime: endTimeStr,
      calendarId: schedule.calendarId,
      isCompleted: schedule.isCompleted,
      location: schedule.location || ''
    });
    setIsDialogOpen(true);
  };

  const getSchedulesForDate = (day: number) => {
    return filteredSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start);
      return (
        scheduleDate.getDate() === day &&
        scheduleDate.getMonth() === currentDate.getMonth() &&
        scheduleDate.getFullYear() === currentDate.getFullYear()
      );
    }).sort((a, b) => {
      // Sort by start time
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAddToTodo = (schedule: Schedule) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: schedule.title,
      description: schedule.description,
      startDate: new Date(schedule.start),
      endDate: new Date(schedule.end),
      status: 'todo',
      parentTaskId: null
    };
    setTasks([...tasks, newTask]);
    toast.success(`"${schedule.title}" 일정이 TODO에 추가되었습니다.`);
  };

  const renderCalendarDays = () => {
    const days = [];
    // Calculate if we need 6 weeks or 5 weeks
    const totalCells = (firstDayOfMonth + daysInMonth > 35) ? 42 : 35;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const daySchedules = isCurrentMonth ? getSchedulesForDate(dayNumber) : [];
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
                {daySchedules.slice(0, 3).map((schedule) => {
                  const startTime = formatTime(new Date(schedule.start));
                  const color = getCalendarColor(schedule.calendarId);

                  return (
                    <ContextMenu key={schedule.id}>
                      <ContextMenuTrigger>
                        <div
                          className="flex items-center gap-1.5 group cursor-pointer hover:opacity-80"
                          title={`${schedule.title} (${startTime})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                        >
                          <div
                            className="w-1 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div className={`text-xs truncate flex-1 ${schedule.isCompleted ? 'line-through opacity-50 text-gray-500' : 'text-gray-700'}`}>
                            <span className="text-gray-500">{startTime} </span>
                            <span>{schedule.title}</span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToTodo(schedule);
                          }}
                        >
                          <ListTodo className="w-4 h-4 mr-2" />
                          TODO에 추가
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                        >
                          편집
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
                {daySchedules.length > 3 && (
                  <div
                    className="text-xs text-gray-500 px-1.5 py-0.5 cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSelectedDaySchedules(daySchedules);
                      setSelectedDayNumber(dayNumber);
                      setPopupPosition({
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX
                      });
                      setIsMoreEventsDialogOpen(true);
                    }}
                  >
                    +{daySchedules.length - 3} 더보기
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
              {editingSchedule ? '일정 편집' : '새 일정 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule ? '일정을 수정합니다.' : '새로운 일정을 추가합니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">제목</Label>
              <Input
                id="event-title"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">시작일</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newSchedule.startDate}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">종료일</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newSchedule.endDate}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time">시작 시간</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">종료 시간</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-calendar">캘린더</Label>
              <Select value={newSchedule.calendarId} onValueChange={(value) => setNewSchedule({ ...newSchedule, calendarId: value })}>
                <SelectTrigger id="event-calendar">
                  <SelectValue placeholder="캘린더를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.filter(cal => cal.type !== 'ecampus').map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <span className="text-sm">{calendar.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event-description">설명 (선택)</Label>
              <Textarea
                id="event-description"
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                placeholder="일정 설명을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="event-location">장소 (선택)</Label>
              <Input
                id="event-location"
                value={newSchedule.location}
                onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                placeholder="장소를 입력하세요"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="event-completed"
                checked={newSchedule.isCompleted}
                onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, isCompleted: !!checked })}
              />
              <Label htmlFor="event-completed" className="cursor-pointer">완료됨</Label>
            </div>

            <Button onClick={handleAddSchedule} className="w-full bg-blue-500 hover:bg-blue-600">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Popup for More Events */}
      {isMoreEventsDialogOpen && popupPosition && (
        <>
          {/* Invisible backdrop to close popup */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMoreEventsDialogOpen(false)}
          />
          {/* Popup */}
          <div
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 w-64"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
          >
            <div className="relative">
              <div className="text-center py-3 border-b border-gray-200">
                <div className="text-gray-500 text-xs mb-1">{monthNames[currentDate.getMonth()]}</div>
                <div className="text-xl">{selectedDayNumber}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setIsMoreEventsDialogOpen(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {selectedDaySchedules.map((schedule) => {
                const startTime = formatTime(new Date(schedule.start));
                const color = getCalendarColor(schedule.calendarId);

                return (
                  <button
                    key={schedule.id}
                    className="w-full text-left px-2 py-1 rounded-md text-white hover:opacity-90 transition-opacity text-xs"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setIsMoreEventsDialogOpen(false);
                      handleEditSchedule(schedule);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={schedule.isCompleted ? 'line-through' : ''}>{startTime}</span>
                      <span className={`flex-1 truncate ${schedule.isCompleted ? 'line-through opacity-70' : ''}`}>{schedule.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

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
