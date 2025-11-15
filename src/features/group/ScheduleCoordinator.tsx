import { useState, Fragment, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

import { Friend } from '../../types';

interface TimeSlotData {
  date: string;
  hour: number;
  isOccupied: boolean;
  isOwn: boolean;
  title?: string;
}

interface Props {
  groupMembers: Friend[];
  onTimeSelected: (data: {
    selectedMembers: string[];
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
}

export default function ScheduleCoordinator({ groupMembers, onTimeSelected, onCancel }: Props) {
  const [step, setStep] = useState<'member-selection' | 'scheduling'>('member-selection');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [memberSchedules, setMemberSchedules] = useState<Map<string, TimeSlotData[]>>(new Map());

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 9); // 9 AM to 10 PM

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange(generateDateRange(startDate, endDate));
    }
  }, [startDate, endDate]);

  const generateDateRange = (start: string, end: string) => {
    if (!start || !end) return [];
    const startD = new Date(start);
    const endD = new Date(end);
    const dates: Date[] = [];
    const current = new Date(startD);

    while (current <= endD) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId) ? prev.filter(m => m !== memberId) : [...prev, memberId]
    );
  };

  // spec.md 규칙: 일정 조율 시 멤버별 일정 표시
  // - 다른 사람 일정: 회색 블록만 (제목/내용 비공개)
  // - 내 일정: 회색 블록 + 제목 표시
  const startScheduling = () => {
    if (selectedMemberIds.length > 0 && dateRange.length > 0) {
      // Mock: 각 멤버의 일정 생성
      const schedules = new Map<string, TimeSlotData[]>();

      selectedMemberIds.forEach(memberId => {
        const slots: TimeSlotData[] = [];
        const randomSlotCount = Math.floor(Math.random() * 5) + 2;

        for (let i = 0; i < randomSlotCount; i++) {
          const randomDate = dateRange[Math.floor(Math.random() * dateRange.length)];
          const randomHour = hours[Math.floor(Math.random() * hours.length)];
          const isOwn = memberId === 'current-user';

          slots.push({
            date: formatDate(randomDate),
            hour: randomHour,
            isOccupied: true,
            isOwn,
            title: isOwn ? '내 일정' : undefined,
          });
        }

        schedules.set(memberId, slots);
      });

      setMemberSchedules(schedules);
      setStep('scheduling');
    }
  };

  const getSlotKey = (day: string, hour: number) => `${day}-${hour}`;

  // 특정 시간대에 일정이 있는지 확인
  const hasScheduleAtSlot = (day: string, hour: number) => {
    for (const slots of memberSchedules.values()) {
      if (slots.some(s => s.date === day && s.hour === hour)) {
        return true;
      }
    }
    return false;
  };

  // 내 일정인지 확인
  const getMyScheduleTitle = (day: string, hour: number) => {
    const mySlots = memberSchedules.get('current-user') || [];
    const slot = mySlots.find(s => s.date === day && s.hour === hour);
    return slot?.title;
  };

  const toggleSlot = (day: string, hour: number) => {
    const key = getSlotKey(day, hour);
    const newSlots = new Set(selectedSlots);
    if (newSlots.has(key)) {
      newSlots.delete(key);
    } else {
      newSlots.add(key);
    }
    setSelectedSlots(newSlots);
  };

  const handleMouseDown = (day: string, hour: number) => {
    if (!hasScheduleAtSlot(day, hour)) {
      setIsDragging(true);
      toggleSlot(day, hour);
    }
  };

  const handleMouseEnter = (day: string, hour: number) => {
    if (isDragging && !hasScheduleAtSlot(day, hour)) {
      toggleSlot(day, hour);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (selectedSlots.size > 0) {
      const slotsByDate = new Map<string, number[]>();
      selectedSlots.forEach(slot => {
        const [dateStr, hourStr] = slot.split('-');
        const hour = parseInt(hourStr);
        if (!slotsByDate.has(dateStr)) {
          slotsByDate.set(dateStr, []);
        }
        slotsByDate.get(dateStr)!.push(hour);
      });

      const firstEntry = Array.from(slotsByDate.entries())[0];
      if (firstEntry) {
        const [dateStr, selectedHours] = firstEntry;
        selectedHours.sort((a, b) => a - b);
        const startHour = selectedHours[0];
        const endHour = selectedHours[selectedHours.length - 1] + 1;

        const match = dateStr.match(/(\d+)\/(\d+)/);
        if (match) {
          const month = parseInt(match[1]);
          const day = parseInt(match[2]);
          const year = new Date().getFullYear();

          const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

          onTimeSelected({
            selectedMembers: selectedMemberIds,
            date: dateString,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${endHour.toString().padStart(2, '0')}:00`,
          });
        }
      }
    }
  };

  const getSlotBackgroundColor = (day: string, hour: number) => {
    const key = getSlotKey(day, hour);
    const isSelected = selectedSlots.has(key);
    const hasSchedule = hasScheduleAtSlot(day, hour);

    if (isSelected) {
      return 'bg-blue-500 hover:bg-blue-600';
    } else if (hasSchedule) {
      return 'bg-gray-400';
    } else {
      return 'bg-white hover:bg-slate-100';
    }
  };

  const getSlotContent = (day: string, hour: number) => {
    const title = getMyScheduleTitle(day, hour);
    if (title) {
      return (
        <div className="text-white text-xs flex items-center justify-center h-full px-1">
          <span className="truncate">{title}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" onMouseUp={handleMouseUp}>
      {step === 'member-selection' ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm mb-2 text-blue-900">일정 조율</h4>
            <p className="text-xs text-blue-800">
              일정을 조율할 멤버와 기간을 선택하세요. 선택된 멤버들의 기존 일정이 회색 블록으로 표시됩니다.
            </p>
          </div>

          <div className="space-y-3">
            <Label>조율 기간 선택</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date" className="text-xs text-gray-600">
                  시작일
                </Label>
                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs text-gray-600">
                  종료일
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {dateRange.length > 0 && (
              <p className="text-xs text-gray-600">
                선택된 기간: {dateRange.length}일 ({formatDate(dateRange[0])} ~{' '}
                {formatDate(dateRange[dateRange.length - 1])})
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>
              참여 멤버 선택 ({selectedMemberIds.length}/{groupMembers.length})
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {groupMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => toggleMember(member.userId)}
                >
                  <Checkbox
                    checked={selectedMemberIds.includes(member.userId)}
                    onCheckedChange={() => toggleMember(member.userId)}
                  />
                  <label className="cursor-pointer flex-1">{member.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              취소
            </Button>
            <Button
              onClick={startScheduling}
              disabled={selectedMemberIds.length === 0 || dateRange.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              일정 조율 시작
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setStep('member-selection')} size="sm">
              ← 멤버 선택으로 돌아가기
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm mb-2 text-blue-900">일정 조율 안내</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 회색 블록: 다른 사람의 일정 (내 일정이면 제목 표시)</li>
                <li>• 파란색 블록: 현재 선택 중인 시간</li>
                <li>• 흰색 블록: 모두 가능한 시간 (선택 가능)</li>
                <li>• 가능한 시간대를 마우스로 드래그하여 선택하세요</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm mb-3 text-slate-700">참가자 ({selectedMemberIds.length}명)</h4>
            <div className="flex flex-wrap gap-2">
              {selectedMemberIds.map(memberId => {
                const member = groupMembers.find(m => m.userId === memberId);
                return (
                  <div key={memberId} className="bg-white px-3 py-1.5 rounded-full text-sm border border-slate-200">
                    {member?.name || memberId}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div
                className="grid gap-0 border border-slate-300"
                style={{ gridTemplateColumns: `80px repeat(${dateRange.length}, 1fr)` }}
              >
                <div className="bg-slate-100 border-b border-r border-slate-300 p-2"></div>
                {dateRange.map(date => (
                  <div
                    key={date.toISOString()}
                    className="bg-slate-100 border-b border-r border-slate-300 p-2 text-center text-sm"
                  >
                    {formatDate(date)}
                  </div>
                ))}

                {hours.map(hour => (
                  <Fragment key={hour}>
                    <div className="bg-slate-50 border-b border-r border-slate-300 p-2 text-sm flex items-center justify-center">
                      {hour}:00
                    </div>
                    {dateRange.map(date => {
                      const key = getSlotKey(formatDate(date), hour);
                      return (
                        <div
                          key={key}
                          className={`border-b border-r border-slate-300 p-0 cursor-pointer transition-colors select-none ${getSlotBackgroundColor(
                            formatDate(date),
                            hour
                          )}`}
                          onMouseDown={() => handleMouseDown(formatDate(date), hour)}
                          onMouseEnter={() => handleMouseEnter(formatDate(date), hour)}
                          style={{ minHeight: '40px' }}
                        >
                          {getSlotContent(formatDate(date), hour)}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              선택된 시간: <span className="font-semibold">{selectedSlots.size}개</span>
            </p>
            <Button onClick={handleSubmit} disabled={selectedSlots.size === 0} className="bg-blue-500 hover:bg-blue-600">
              다음 (일정 생성)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
