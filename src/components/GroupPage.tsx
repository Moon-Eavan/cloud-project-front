import { useState } from 'react';
import { Plus, Users, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import When2MeetScheduler from './When2MeetScheduler';

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: Date;
}

interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  type: 'online' | 'offline';
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  link?: string;
  members: string[];
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  status: 'online' | 'offline';
}

interface GroupPageProps {
  onAddEvent: (event: CalendarEvent) => void;
  friends: Friend[];
}

const initialGroups: Group[] = [
  {
    id: '1',
    name: '웹개발 스터디',
    description: 'React와 TypeScript 스터디 그룹',
    members: ['홍길동', '김철수', '이영희'],
    createdAt: new Date(2025, 10, 1),
  },
  {
    id: '2',
    name: '프로젝트 팀 A',
    description: '캡스톤 프로젝트 팀',
    members: ['홍길동', '박민수', '최지은', '정수아'],
    createdAt: new Date(2025, 9, 15),
  },
];

export default function GroupPage({ onAddEvent, friends }: GroupPageProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isWhen2MeetOpen, setIsWhen2MeetOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isFromCoordinator, setIsFromCoordinator] = useState(false);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '',
    selectedMembers: [] as string[]
  });
  
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
  
  // 시작 시간으로부터 2시간 후를 계산
  const addTwoHours = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const newHours = (parseInt(hours) + 2) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes}`;
  };
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'offline' as 'online' | 'offline',
    date: getTodayDate(),
    startTime: getCurrentHour(),
    endTime: getCurrentHourPlus2(),
    location: '',
    members: [] as string[],
  });

  const handleCreateGroup = () => {
    if (newGroup.name.trim()) {
      setGroups([
        ...groups,
        {
          id: Date.now().toString(),
          name: newGroup.name,
          description: newGroup.description,
          members: newGroup.selectedMembers,
          createdAt: new Date(),
        },
      ]);
      setNewGroup({ name: '', description: '', selectedMembers: [] });
      setIsGroupDialogOpen(false);
    }
  };

  const handleCreateEvent = () => {
    if (selectedGroup && newEvent.title.trim() && newEvent.date && newEvent.startTime) {
      const eventId = Date.now().toString();
      setEvents([
        ...events,
        {
          id: eventId,
          groupId: selectedGroup.id,
          ...newEvent,
        },
      ]);
      
      // Build description for calendar event
      let calendarDescription = newEvent.description || '';
      if (newEvent.location) {
        calendarDescription = calendarDescription 
          ? `${calendarDescription}\n장소: ${newEvent.location}` 
          : `장소: ${newEvent.location}`;
      }
      
      setNewEvent({ 
        title: '', 
        description: '',
        type: 'offline', 
        date: getTodayDate(), 
        startTime: getCurrentHour(), 
        endTime: getCurrentHourPlus2(),
        location: '', 
        members: [] 
      });
      setIsEventDialogOpen(false);
      onAddEvent({
        id: eventId,
        title: newEvent.title,
        description: calendarDescription,
        date: new Date(newEvent.date),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        color: 'blue',
      });
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    setEvents(events.filter((e) => e.groupId !== groupId));
  };

  const getGroupEvents = (groupId: string) => {
    return events.filter((e) => e.groupId === groupId);
  };

  const handleAddEventFromScheduler = (calendarEvent: CalendarEvent) => {
    // 캘린더에 일정 추가
    onAddEvent(calendarEvent);
    
    // 그룹 이벤트에도 추가
    if (selectedGroup) {
      const groupEvent: GroupEvent = {
        id: calendarEvent.id,
        groupId: selectedGroup.id,
        title: calendarEvent.title,
        description: calendarEvent.description,
        type: 'offline',
        date: calendarEvent.date.toISOString().split('T')[0],
        startTime: calendarEvent.startTime || '',
        endTime: calendarEvent.endTime || '',
        location: '',
        members: selectedGroup.members,
      };
      setEvents([...events, groupEvent]);
    }
  };

  // 일정 다이얼로그가 열릴 때 날짜와 시간을 최신으로 업데이트
  const handleOpenEventDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsFromCoordinator(false);
    setNewEvent({
      title: '',
      description: '',
      type: 'offline',
      date: getTodayDate(),
      startTime: getCurrentHour(),
      endTime: getCurrentHourPlus2(),
      location: '',
      members: [],
    });
    setIsEventDialogOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-gray-900">그룹</h2>
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              그룹 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 그룹 생성</DialogTitle>
              <DialogDescription>새로운 그룹을 생성합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="group-name">그룹 이름</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="그룹 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="group-description">그룹 설명</Label>
                <Textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="그룹 설명을 입력하세요"
                />
              </div>
              <div>
                <Label>참여 멤버 선택 ({newGroup.selectedMembers.length}/{friends.length})</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        const isSelected = newGroup.selectedMembers.includes(friend.name);
                        setNewGroup({
                          ...newGroup,
                          selectedMembers: isSelected
                            ? newGroup.selectedMembers.filter((m) => m !== friend.name)
                            : [...newGroup.selectedMembers, friend.name],
                        });
                      }}
                    >
                      <Checkbox
                        checked={newGroup.selectedMembers.includes(friend.name)}
                        onCheckedChange={() => {
                          const isSelected = newGroup.selectedMembers.includes(friend.name);
                          setNewGroup({
                            ...newGroup,
                            selectedMembers: isSelected
                              ? newGroup.selectedMembers.filter((m) => m !== friend.name)
                              : [...newGroup.selectedMembers, friend.name],
                          });
                        }}
                      />
                      <label className="cursor-pointer flex-1 text-sm">{friend.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 일정 생성 - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>그룹 일정을 생성합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">일정 제목</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="event-description">일정 설명</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="일정 설명을 입력하세요"
              />
            </div>
            <div>
              <Label>일정 유형</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newEvent.type === 'offline'}
                    onChange={() => setNewEvent({ ...newEvent, type: 'offline' })}
                  />
                  <span>오프라인</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newEvent.type === 'online'}
                    onChange={() => setNewEvent({ ...newEvent, type: 'online' })}
                  />
                  <span>온라인</span>
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="event-date">날짜</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                disabled={isFromCoordinator}
                className={isFromCoordinator ? 'bg-slate-100 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <Label htmlFor="event-start-time">시작 시간</Label>
              <Input
                id="event-start-time"
                type="time"
                value={newEvent.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  setNewEvent({ 
                    ...newEvent, 
                    startTime: newStartTime,
                    endTime: addTwoHours(newStartTime)
                  });
                }}
                disabled={isFromCoordinator}
                className={isFromCoordinator ? 'bg-slate-100 cursor-not-allowed' : ''}
              />
            </div>
            <div>
              <Label htmlFor="event-end-time">종료 시간</Label>
              <Input
                id="event-end-time"
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                disabled={isFromCoordinator}
                className={isFromCoordinator ? 'bg-slate-100 cursor-not-allowed' : ''}
              />
            </div>
            {newEvent.type === 'offline' && (
              <div>
                <Label htmlFor="event-location">장소</Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="만날 장소를 입력하세요"
                />
              </div>
            )}
            {newEvent.type === 'online' && (
              <div>
                <Label htmlFor="event-link">링크</Label>
                <Input
                  id="event-link"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="온라인 미팅 링크를 입력하세요"
                />
              </div>
            )}
            <div>
              <Label>참여 멤버 선택 ({newEvent.members.length}/{selectedGroup?.members.length || 0})</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                {selectedGroup?.members.map((member) => (
                  <div
                    key={member}
                    className={`flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg ${
                      isFromCoordinator ? 'cursor-not-allowed opacity-60' : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (isFromCoordinator) return;
                      const isSelected = newEvent.members.includes(member);
                      setNewEvent({
                        ...newEvent,
                        members: isSelected
                          ? newEvent.members.filter((m) => m !== member)
                          : [...newEvent.members, member],
                      });
                    }}
                  >
                    <Checkbox
                      checked={newEvent.members.includes(member)}
                      disabled={isFromCoordinator}
                      onCheckedChange={() => {
                        if (isFromCoordinator) return;
                        const isSelected = newEvent.members.includes(member);
                        setNewEvent({
                          ...newEvent,
                          members: isSelected
                            ? newEvent.members.filter((m) => m !== member)
                            : [...newEvent.members, member],
                        });
                      }}
                    />
                    <label className="cursor-pointer flex-1 text-sm">{member}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateEvent} className="w-full">
                생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWhen2MeetOpen} onOpenChange={setIsWhen2MeetOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>일정 조율 - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>그룹원들과 일정을 조율합니다.</DialogDescription>
          </DialogHeader>
          <When2MeetScheduler 
            groupName={selectedGroup?.name || ''} 
            groupMembers={selectedGroup?.members || []} 
            onAddEvent={handleAddEventFromScheduler}
            onTimeSelected={(data) => {
              setIsFromCoordinator(true);
              setNewEvent({
                title: '',
                description: '',
                type: 'offline',
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                location: '',
                members: data.selectedMembers,
              });
              setIsWhen2MeetOpen(false);
              setIsEventDialogOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-xl transition-all bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2 text-gray-900">
                    <Users className="w-5 h-5" />
                    {group.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">멤버 ({group.members.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member, idx) => (
                      <Badge key={idx} variant="secondary">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    일정 ({getGroupEvents(group.id).length})
                  </p>
                  {getGroupEvents(group.id).length > 0 ? (
                    <div className="space-y-2">
                      {getGroupEvents(group.id).slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-sm p-2 bg-slate-50 rounded flex items-center gap-2"
                        >
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">{event.title}</span>
                          <Badge variant="outline" className="ml-auto">
                            <Users className="w-3 h-3 mr-1" />
                            {event.members.length}명
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">등록된 일정이 없습니다</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEventDialog(group)}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    일정 추가
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsWhen2MeetOpen(true);
                    }}
                  >
                    일정 조율
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}