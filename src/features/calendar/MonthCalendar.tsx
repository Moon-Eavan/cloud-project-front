import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, ListTodo } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../../components/ui/context-menu';
import { toast } from 'sonner';

import { Schedule } from '../../types';
import { useScheduleContext } from '../../store/ScheduleContext';
import { useTaskContext } from '../../store/TaskContext';
import { SCHEDULE_COLORS, MONTH_NAMES, DAY_NAMES } from '../../lib/constants';
import { getTodayDate, getCurrentHour, getCurrentHourPlus, formatDate, formatTime } from '../../lib/utils';

export default function MonthCalendar() {
  const { schedules, createSchedule, updateSchedule } = useScheduleContext();
  const { createTaskFromSchedule } = useTaskContext();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [newScheduleForm, setNewScheduleForm] = useState({
    title: '',
    description: '',
    startDate: getTodayDate(),
    startTime: getCurrentHour(),
    endDate: getTodayDate(),
    endTime: getCurrentHourPlus(2),
    color: 'blue',
    location: '',
    isCompleted: false,
  });

  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleSaveSchedule = async () => {
    if (!newScheduleForm.title.trim() || !newScheduleForm.startDate) {
      toast.error('제목과 시작일을 입력해주세요.');
      return;
    }

    const startDateTime = new Date(`${newScheduleForm.startDate}T${newScheduleForm.startTime || '00:00'}`);
    const endDateTime = new Date(`${newScheduleForm.endDate || newScheduleForm.startDate}T${newScheduleForm.endTime || '23:59'}`);

    if (editingSchedule) {
      // 수정 모드
      await updateSchedule(editingSchedule.id, {
        title: newScheduleForm.title,
        description: newScheduleForm.description || undefined,
        start: startDateTime,
        end: endDateTime,
        location: newScheduleForm.location || undefined,
        isCompleted: newScheduleForm.isCompleted,
        color: newScheduleForm.color,
      });
      toast.success('일정이 수정되었습니다.');
      setEditingSchedule(null);
    } else {
      // 생성 모드
      await createSchedule({
        title: newScheduleForm.title,
        description: newScheduleForm.description || undefined,
        start: startDateTime,
        end: endDateTime,
        location: newScheduleForm.location || undefined,
        isCompleted: newScheduleForm.isCompleted,
        color: newScheduleForm.color,
      });
      toast.success('일정이 추가되었습니다.');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewScheduleForm({
      title: '',
      description: '',
      startDate: getTodayDate(),
      startTime: getCurrentHour(),
      endDate: getTodayDate(),
      endTime: getCurrentHourPlus(2),
      color: 'blue',
      location: '',
      isCompleted: false,
    });
    setEditingSchedule(null);
  };

  const handleOpenDialog = (date?: Date) => {
    resetForm();
    if (date) {
      const dateStr = formatDate(date);
      setNewScheduleForm(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
        startTime: getCurrentHour(),
        endTime: getCurrentHourPlus(2),
      }));
    }
    setIsDialogOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setNewScheduleForm({
      title: schedule.title,
      description: schedule.description || '',
      startDate: formatDate(schedule.start),
      startTime: formatTime(schedule.start),
      endDate: formatDate(schedule.end),
      endTime: formatTime(schedule.end),
      color: schedule.color || 'blue',
      location: schedule.location || '',
      isCompleted: schedule.isCompleted,
    });
    setIsDialogOpen(true);
  };

  // spec.md 규칙: "task에 추가" 버튼 동작
  // - 새로운 parent task를 생성
  // - startDate = 오늘 날짜, endDate = schedule의 end 날짜
  // - status = todo, parentTaskId = null
  const handleAddToTask = async (schedule: Schedule) => {
    await createTaskFromSchedule(
      schedule.title,
      schedule.description || '',
      schedule.end
    );
    toast.success(`"${schedule.title}" 일정이 Task에 추가되었습니다.`);
  };

  const getSchedulesForDate = (day: number) => {
    return schedules
      .filter(schedule => {
        const scheduleDate = schedule.start;
        return (
          scheduleDate.getDate() === day &&
          scheduleDate.getMonth() === currentDate.getMonth() &&
          scheduleDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getColorClass = (color: string) => {
    const colorOption = SCHEDULE_COLORS.find(c => c.value === color);
    return colorOption || SCHEDULE_COLORS[0];
  };

  const renderCalendarDays = () => {
    const days = [];
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
                {daySchedules.slice(0, 3).map(schedule => {
                  const colorClass = getColorClass(schedule.color || 'blue');
                  return (
                    <ContextMenu key={schedule.id}>
                      <ContextMenuTrigger>
                        <div
                          className="flex items-center gap-1.5 group cursor-pointer hover:opacity-80"
                          title={`${schedule.title}${schedule.start ? ` (${formatTime(schedule.start)})` : ''}`}
                          onClick={e => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                        >
                          <div className={`w-1 h-4 rounded-full ${colorClass.bg} flex-shrink-0`}></div>
                          <div
                            className={`text-xs truncate flex-1 ${
                              schedule.isCompleted ? 'line-through opacity-50 text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            <span className="text-gray-500">{formatTime(schedule.start)} </span>
                            <span>{schedule.title}</span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            handleAddToTask(schedule);
                          }}
                        >
                          <ListTodo className="w-4 h-4 mr-2" />
                          Task에 추가
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={e => {
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
                  <div className="text-xs text-gray-500 px-1.5 py-0.5">+{daySchedules.length - 3} 더보기</div>
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
          <Button variant="outline" onClick={goToToday} className="rounded-lg border-gray-300 hover:bg-gray-100">
            오늘
          </Button>
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="min-w-32 text-center text-gray-900">
              {currentDate.getFullYear()}년 {MONTH_NAMES[currentDate.getMonth()]}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-500 hover:bg-blue-600 gap-2">
          <Plus className="w-4 h-4" />
          일정 추가
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? '일정 편집' : '일정 추가'}</DialogTitle>
            <DialogDescription>{editingSchedule ? '일정을 수정합니다.' : '새로운 일정을 추가합니다.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="schedule-title">제목</Label>
              <Input
                id="schedule-title"
                value={newScheduleForm.title}
                onChange={e => setNewScheduleForm({ ...newScheduleForm, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">시작일</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newScheduleForm.startDate}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">종료일</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newScheduleForm.endDate}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time">시작 시간</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newScheduleForm.startTime}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">종료 시간</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newScheduleForm.endTime}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="schedule-color">색상</Label>
              <Select
                value={newScheduleForm.color}
                onValueChange={value => setNewScheduleForm({ ...newScheduleForm, color: value })}
              >
                <SelectTrigger id="schedule-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_COLORS.map(option => (
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
              <Label htmlFor="schedule-description">설명 (선택)</Label>
              <Textarea
                id="schedule-description"
                value={newScheduleForm.description}
                onChange={e => setNewScheduleForm({ ...newScheduleForm, description: e.target.value })}
                placeholder="일정 설명을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="schedule-location">장소 (선택)</Label>
              <Input
                id="schedule-location"
                value={newScheduleForm.location}
                onChange={e => setNewScheduleForm({ ...newScheduleForm, location: e.target.value })}
                placeholder="장소를 입력하세요"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule-completed"
                checked={newScheduleForm.isCompleted}
                onCheckedChange={checked => setNewScheduleForm({ ...newScheduleForm, isCompleted: !!checked })}
              />
              <Label htmlFor="schedule-completed" className="cursor-pointer">
                완료됨
              </Label>
            </div>

            <Button onClick={handleSaveSchedule} className="w-full bg-blue-500 hover:bg-blue-600">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-300 bg-white">
          {DAY_NAMES.map((day, index) => (
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

        <div className="grid grid-cols-7">{renderCalendarDays()}</div>
      </div>
    </div>
  );
}
