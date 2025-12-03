import { useState, Fragment, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface TimeSlot {
  day: string;
  hour: number;
  selected: boolean;
}

interface Participant {
  id: string;
  name: string;
  slots: Set<string>;
  schedules: any[];
}

interface Props {
  groupName: string;
  groupMembers: Array<{ id: string; name: string }>;
  memberSchedules: Array<{ userId: string; userName: string; schedules: any[] }>;
  currentUserId?: string; // Current user's cognitoSub
  onTimeSelected?: (data: {
    selectedMembers: string[];
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onBack?: () => void;
}

export default function When2MeetScheduler({
  groupName,
  groupMembers,
  memberSchedules,
  currentUserId,
  onTimeSelected,
  onBack
}: Props) {
  const [step, setStep] = useState<'member-selection' | 'scheduling'>('member-selection');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // 오늘 날짜를 기본값으로 설정
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 9); // 9 AM to 10 PM

  // 초기 로드 시 날짜 범위 설정
  useEffect(() => {
    if (startDate && endDate) {
      setDateRange(generateDateRange(startDate, endDate));
    }
  }, []);

  // 날짜 범위 생성
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

  // 날짜를 표시 문자열로 변환
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  };

  // 멤버 선택 토글
  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((m) => m !== memberId) : [...prev, memberId]
    );
  };

  // 일정 조율 시작
  const startScheduling = () => {
    if (selectedMembers.length > 0) {
      console.log('[When2Meet] Starting scheduling with members:', selectedMembers);
      console.log('[When2Meet] Member schedules data:', memberSchedules);
      console.log('[When2Meet] Date range:', dateRange);

      // 선택된 멤버들의 실제 일정을 participants로 변환
      const selectedParticipants: Participant[] = selectedMembers.map((memberId) => {
        const memberData = memberSchedules.find(m => m.userId === memberId);
        const memberInfo = groupMembers.find(m => m.id === memberId);

        console.log(`[When2Meet] Processing member ${memberId}:`, memberData);

        // 해당 멤버의 일정을 슬롯으로 변환
        const slots = new Set<string>();
        if (memberData && memberData.schedules) {
          console.log(`[When2Meet] Member ${memberId} has ${memberData.schedules.length} schedules`);

          memberData.schedules.forEach((schedule: any) => {
            const scheduleStart = new Date(schedule.start);
            const scheduleEnd = new Date(schedule.end);

            console.log(`[When2Meet] Processing schedule: ${schedule.title}`, {
              start: scheduleStart,
              end: scheduleEnd,
              startStr: scheduleStart.toDateString(),
              endStr: scheduleEnd.toDateString(),
            });

            // 날짜 범위 내의 일정만 처리
            dateRange.forEach(date => {
              const dateStr = formatDate(date);

              // 해당 날짜에 일정이 있는지 확인
              if (scheduleStart.toDateString() === date.toDateString()) {
                const startHour = scheduleStart.getHours();
                const endHour = scheduleEnd.getHours();

                console.log(`[When2Meet] Match found! Date: ${dateStr}, Hours: ${startHour}-${endHour}`);

                // 해당 시간대를 슬롯에 추가
                for (let hour = startHour; hour < endHour; hour++) {
                  if (hours.includes(hour)) {
                    const slotKey = `${dateStr}-${hour}`;
                    slots.add(slotKey);
                    console.log(`[When2Meet] Added slot: ${slotKey}`);
                  }
                }
              }
            });
          });
        }

        console.log(`[When2Meet] Member ${memberId} total slots:`, Array.from(slots));

        return {
          id: memberId,
          name: memberInfo?.name || memberData?.userName || '알 수 없음',
          slots,
          schedules: memberData?.schedules || [],
        };
      });

      console.log('[When2Meet] Final participants:', selectedParticipants);
      setParticipants(selectedParticipants);
      setStep('scheduling');
    }
  };

  const getSlotKey = (day: string, hour: number) => `${day}-${hour}`;

  // 특정 시간대에 몇 명이 일정이 있는지 계산
  const getParticipantCountForSlot = (day: string, hour: number) => {
    const key = getSlotKey(day, hour);
    return participants.filter((p) => p.slots.has(key)).length;
  };

  // 특정 시간대가 누군가의 일정인지 확인 (선택 불가 여부)
  const hasAnySchedule = (day: string, hour: number) => {
    return getParticipantCountForSlot(day, hour) > 0;
  };

  // 현재 사용자의 일정인지 확인
  const isMySchedule = (day: string, hour: number) => {
    const key = getSlotKey(day, hour);
    const currentUserParticipant = participants.find(p => p.id === currentUserId);
    return currentUserParticipant?.slots.has(key) || false;
  };

  // 현재 사용자의 일정 제목 가져오기
  const getMyScheduleTitle = (day: string, hour: number) => {
    const currentUserParticipant = participants.find(p => p.id === currentUserId);
    if (!currentUserParticipant) return null;

    // day 문자열에서 날짜 정보 추출 (예: "11/20(수)" -> 11월 20일)
    const match = day.match(/(\d+)\/(\d+)/);
    if (!match) return null;

    const month = parseInt(match[1]);
    const dayNum = parseInt(match[2]);

    // 해당 시간대가 포함된 일정 찾기 (시작 시간뿐만 아니라 시작~종료 사이의 모든 시간 확인)
    const schedule = currentUserParticipant.schedules.find((s: any) => {
      const scheduleStart = new Date(s.start);
      const scheduleEnd = new Date(s.end);
      const scheduleMonth = scheduleStart.getMonth() + 1;
      const scheduleDay = scheduleStart.getDate();
      const scheduleStartHour = scheduleStart.getHours();
      const scheduleEndHour = scheduleEnd.getHours();

      // 같은 날짜이고, 해당 시간이 일정의 시작~종료 시간 사이에 있는지 확인
      return scheduleMonth === month && scheduleDay === dayNum &&
             hour >= scheduleStartHour && hour < scheduleEndHour;
    });

    return schedule?.title || null;
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
    const hasSchedule = hasAnySchedule(day, hour);

    // 누군가의 일정이 있으면 선택 불가 (내 일정이든 남의 일정이든)
    if (!hasSchedule) {
      setIsDragging(true);
      toggleSlot(day, hour);
    }
  };

  const handleMouseEnter = (day: string, hour: number) => {
    const hasSchedule = hasAnySchedule(day, hour);

    // 누군가의 일정이 있으면 선택 불가
    if (isDragging && !hasSchedule) {
      toggleSlot(day, hour);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (selectedSlots.size > 0 && onTimeSelected) {
      // 선택된 시간대를 날짜별로 그룹화
      const slotsByDate = new Map<string, number[]>();
      selectedSlots.forEach((slot) => {
        const [dateStr, hourStr] = slot.split('-');
        const hour = parseInt(hourStr);
        if (!slotsByDate.has(dateStr)) {
          slotsByDate.set(dateStr, []);
        }
        slotsByDate.get(dateStr)!.push(hour);
      });

      // 첫 번째 날짜의 시간 범위를 사용
      const firstEntry = Array.from(slotsByDate.entries())[0];
      if (firstEntry) {
        const [dateStr, hours] = firstEntry;
        hours.sort((a, b) => a - b);
        const startHour = hours[0];
        const endHour = hours[hours.length - 1] + 1;

        // dateStr에서 실제 날짜 추출 (예: "11/14(금)" -> "2025-11-14")
        const match = dateStr.match(/(\d+)\/(\d+)/);
        if (match) {
          const month = parseInt(match[1]);
          const day = parseInt(match[2]);
          const year = new Date().getFullYear();

          const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

          onTimeSelected({
            selectedMembers,
            date: dateString,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${endHour.toString().padStart(2, '0')}:00`,
          });
        }
      }
    }
  };

  // 시간대의 배경색 결정
  const getSlotBackgroundColor = (day: string, hour: number) => {
    const key = getSlotKey(day, hour);
    const isSelected = selectedSlots.has(key);
    const hasSchedule = hasAnySchedule(day, hour);

    if (isSelected) {
      // 선택된 시간 (파란색)
      return 'bg-blue-500 hover:bg-blue-600';
    } else if (hasSchedule) {
      // 누군가의 일정이 있는 시간 (회색)
      return 'bg-gray-400 cursor-not-allowed';
    } else {
      // 빈 시간 (흰색)
      return 'bg-white hover:bg-slate-100';
    }
  };

  // 시간대의 표시 내용 결정
  const getSlotContent = (day: string, hour: number) => {
    const isMine = isMySchedule(day, hour);

    // 내 일정인 경우에만 제목 표시
    if (isMine) {
      const title = getMyScheduleTitle(day, hour);
      if (title) {
        return (
          <div className="text-white text-xs flex flex-col items-center justify-center h-full px-1">
            <span className="truncate w-full text-center font-medium">{title}</span>
          </div>
        );
      }
    }
    // 남의 일정이거나 빈 시간인 경우 아무것도 표시하지 않음
    return null;
  };

  return (
    <div className="space-y-6" onMouseUp={handleMouseUp}>
      {step === 'member-selection' ? (
        // 멤버 선택 단계
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm mb-2 text-blue-900">일정 조율 참여 멤버 선택</h4>
            <p className="text-xs text-blue-800">
              일정을 조율할 그룹 멤버를 선택하세요. 선택된 멤버들의 기존 일정이 표시됩니다.
            </p>
          </div>

          <div className="space-y-3">
            <Label>일정 조율 기간</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date" className="text-xs text-gray-600">시작일</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate) {
                      setDateRange(generateDateRange(e.target.value, endDate));
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs text-gray-600">종료일</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate) {
                      setDateRange(generateDateRange(startDate, e.target.value));
                    }
                  }}
                />
              </div>
            </div>
            {dateRange.length > 0 && (
              <p className="text-xs text-gray-600">
                선택된 기간: {dateRange.length}일 ({formatDate(dateRange[0])} ~ {formatDate(dateRange[dateRange.length - 1])})
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>참여 멤버 선택 ({selectedMembers.length}/{groupMembers.length})</Label>
            <div className="grid grid-cols-2 gap-3">
              {groupMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <span className="cursor-pointer flex-1">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                취소
              </Button>
            )}
            <Button
              onClick={startScheduling}
              disabled={selectedMembers.length === 0 || dateRange.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              일정 조율 시작 ({selectedMembers.length}명 참여)
            </Button>
          </div>
        </div>
      ) : (
        // 일정 조율 단계
        <>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setStep('member-selection')}
              size="sm"
            >
              ← 멤버 선택으로 돌아가기
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm mb-2 text-blue-900">일정 조율 안내</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 회색 시간대: 팀원의 일정이 있는 시간 (내 일정이 있으면 제목 표시)</li>
                <li>• 파란색 시간대: 현재 선택 중인 시간</li>
                <li>• 흰색 시간대: 모두 가능한 시간 (선택 가능)</li>
                <li>• 가능한 시간대를 마우스로 드래그하여 선택하세요</li>
              </ul>
            </div>
          </div>

          {/* 참가자 목록 */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm mb-3 text-slate-700">참가자 목록 ({participants.length}명)</h4>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant, idx) => (
                <div key={idx} className="bg-white px-3 py-1.5 rounded-full text-sm border border-slate-200">
                  {participant.name}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div
                className="grid gap-0 border border-slate-300"
                style={{ gridTemplateColumns: `80px repeat(${dateRange.length}, 1fr)` }}
              >
                {/* Header */}
                <div className="bg-slate-100 border-b border-r border-slate-300 p-2"></div>
                {dateRange.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="bg-slate-100 border-b border-r border-slate-300 p-2 text-center text-sm"
                  >
                    {formatDate(date)}
                  </div>
                ))}

                {/* Time Slots */}
                {hours.map((hour) => (
                  <Fragment key={hour}>
                    <div
                      className="bg-slate-50 border-b border-r border-slate-300 p-2 text-sm flex items-center justify-center"
                    >
                      {hour}:00
                    </div>
                    {dateRange.map((date) => {
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
              이 시간으로 일정 생성
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
