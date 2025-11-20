import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { groupsApi, schedulesApi } from '@/api';
import type { Group, GroupSchedule, Friend, Schedule } from '@/types';
import When2MeetScheduler from '@/components/When2MeetScheduler';

const initialFriends: Friend[] = [
  {
    id: 'friend-1',
    name: '김민수',
    email: 'minsu.kim@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-2',
    name: '이지은',
    email: 'jieun.lee@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
  {
    id: 'friend-3',
    name: '박서준',
    email: 'seojun.park@example.com',
    profileImage: undefined,
    status: 'accepted',
  },
];

interface GroupsPageProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

export default function GroupsPage({ schedules, setSchedules }: GroupsPageProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSchedules, setGroupSchedules] = useState<GroupSchedule[]>([]);
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCoordinationDialogOpen, setIsCoordinationDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    selectedMembers: [] as string[],
  });

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentHour = () => {
    const hours = new Date().getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  };
  const getCurrentHourPlus2 = () => {
    const hours = (new Date().getHours() + 2).toString().padStart(2, '0');
    return `${hours}:00`;
  };

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: getTodayDate(),
    startTime: getCurrentHour(),
    endTime: getCurrentHourPlus2(),
    location: '',
    members: [] as string[],
  });

  const [coordination, setCoordination] = useState({
    memberSchedules: [] as any[],
    isLoading: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsData = await groupsApi.listGroups();
      setGroups(groupsData);

      // Load all group schedules
      const allSchedules: GroupSchedule[] = [];
      for (const group of groupsData) {
        const schedules = await groupsApi.getGroupSchedules(group.id);
        allSchedules.push(...schedules);
      }
      setGroupSchedules(allSchedules);
    } catch (error) {
      console.error('Failed to load groups:', error);
      toast.error('데이터 로드 실패');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('그룹 이름을 입력하세요');
      return;
    }

    try {
      const created = await groupsApi.createGroup(newGroup.name, newGroup.selectedMembers);
      setGroups((prev) => [...prev, created]);
      setNewGroup({ name: '', description: '', selectedMembers: [] });
      setIsGroupDialogOpen(false);
      toast.success('그룹이 생성되었습니다');
    } catch (error: any) {
      toast.error(error.message || '그룹 생성 실패');
    }
  };

  const handleCreateEvent = async () => {
    if (!selectedGroup || !newEvent.title.trim()) {
      toast.error('제목을 입력하세요');
      return;
    }

    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

      const created = await groupsApi.createGroupSchedule(selectedGroup.id, {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        start: startDateTime,
        end: endDateTime,
        memberIds: newEvent.members,
      });

      setGroupSchedules((prev) => [...prev, created]);

      // Also add to global calendar schedules
      const calendarSchedule: Schedule = {
        id: `group-${created.id}`,
        title: created.title,
        description: created.description || '',
        start: created.start,
        end: created.end,
        location: created.location,
        isCompleted: false,
        calendarId: 'local-calendar', // Add to local calendar
      };
      setSchedules((prev) => [...prev, calendarSchedule]);

      setNewEvent({
        title: '',
        description: '',
        date: getTodayDate(),
        startTime: getCurrentHour(),
        endTime: getCurrentHourPlus2(),
        location: '',
        members: [],
      });
      setIsEventDialogOpen(false);
      toast.success('그룹 일정이 생성되었습니다');
    } catch (error: any) {
      toast.error(error.message || '일정 생성 실패');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupsApi.deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setGroupSchedules((prev) => prev.filter((s) => s.groupId !== groupId));
      toast.success('그룹이 삭제되었습니다');
    } catch (error: any) {
      toast.error(error.message || '그룹 삭제 실패');
    }
  };

  const getGroupSchedules = (groupId: string) => {
    return groupSchedules.filter((s) => s.groupId === groupId);
  };

  const handleOpenEventDialog = (group: Group) => {
    setSelectedGroup(group);
    setNewEvent({
      title: '',
      description: '',
      date: getTodayDate(),
      startTime: getCurrentHour(),
      endTime: getCurrentHourPlus2(),
      location: '',
      members: [],
    });
    setIsEventDialogOpen(true);
  };

  const handleOpenCoordinationDialog = async (group: Group) => {
    setSelectedGroup(group);
    setIsCoordinationDialogOpen(true);

    // 그룹 멤버들의 일정을 미리 로드
    try {
      setCoordination({ memberSchedules: [], isLoading: true });

      // 현재 날짜 기준 한 달 기간으로 일정 조회
      const startDate = new Date();
      startDate.setDate(1); // 이번 달 1일
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // 이번 달 마지막 날
      endDate.setHours(23, 59, 59, 999);

      const memberSchedules = await groupsApi.getMemberSchedulesForCoordination({
        memberIds: group.memberIds,
        period: {
          start: startDate,
          end: endDate,
        },
      });

      setCoordination({ memberSchedules, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load member schedules:', error);
      setCoordination({ memberSchedules: [], isLoading: false });
      toast.error('멤버 일정 로드 실패');
    }
  };

  const handleTimeSelected = (data: {
    selectedMembers: string[];
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    // 선택된 시간으로 일정 생성 다이얼로그 열기
    setNewEvent({
      title: '',
      description: '',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: '',
      members: data.selectedMembers,
    });
    setIsCoordinationDialogOpen(false);
    setIsEventDialogOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">그룹</h2>
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
                <Label>
                  참여 멤버 선택 ({newGroup.selectedMembers.length}/{friends.length})
                </Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                  {friends.map((friend) => (
                    <label
                      key={friend.id}
                      className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={newGroup.selectedMembers.includes(friend.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewGroup({
                              ...newGroup,
                              selectedMembers: [...newGroup.selectedMembers, friend.id],
                            });
                          } else {
                            setNewGroup({
                              ...newGroup,
                              selectedMembers: newGroup.selectedMembers.filter((m) => m !== friend.id),
                            });
                          }
                        }}
                      />
                      <span className="flex-1 text-sm">{friend.name}</span>
                    </label>
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
              <Label htmlFor="event-date">날짜</Label>
              <Input id="event-date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-start-time">시작 시간</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-end-time">종료 시간</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-location">장소</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="만날 장소를 입력하세요"
              />
            </div>
            <div>
              <Label>참여 멤버 선택 ({newEvent.members.length}/{selectedGroup?.memberIds.length || 0})</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                {selectedGroup?.memberIds.map((memberId) => {
                  const friend = friends.find((f) => f.id === memberId);
                  // 현재 사용자인 경우 "나"로 표시
                  const displayName = memberId === 'current-user-id' ? '나' : (friend?.name || '알 수 없음');
                  return (
                    <div
                      key={memberId}
                      className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        const isSelected = newEvent.members.includes(memberId);
                        setNewEvent({
                          ...newEvent,
                          members: isSelected ? newEvent.members.filter((m) => m !== memberId) : [...newEvent.members, memberId],
                        });
                      }}
                    >
                      <Checkbox checked={newEvent.members.includes(memberId)} />
                      <label className="cursor-pointer flex-1 text-sm">{displayName}</label>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button onClick={handleCreateEvent} className="w-full">
              생성
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Coordination Dialog */}
      <Dialog open={isCoordinationDialogOpen} onOpenChange={setIsCoordinationDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>일정 조율 - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>멤버들과 함께 가능한 시간대를 찾아보세요.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {coordination.isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">멤버 일정을 불러오는 중...</p>
              </div>
            ) : (
              <When2MeetScheduler
                groupName={selectedGroup?.name || ''}
                groupMembers={
                  selectedGroup?.memberIds.map((memberId) => {
                    const friend = friends.find((f) => f.id === memberId);
                    const displayName = memberId === 'current-user-id' ? '나' : (friend?.name || '알 수 없음');
                    return {
                      id: memberId,
                      name: displayName,
                    };
                  }) || []
                }
                memberSchedules={coordination.memberSchedules}
                onTimeSelected={handleTimeSelected}
                onBack={() => setIsCoordinationDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>그룹이 없습니다</p>
            <p className="text-sm mt-2">새 그룹을 생성해보세요!</p>
          </div>
        ) : (
          groups.map((group) => {
            const schedules = getGroupSchedules(group.id);
            return (
              <Card key={group.id} className="hover:shadow-xl transition-all bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2 text-gray-900">
                        <Users className="w-5 h-5" />
                        {group.name}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)} className="hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-2">멤버 ({group.memberIds.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {group.memberIds.slice(0, 3).map((memberId, idx) => {
                          const friend = friends.find((f) => f.id === memberId);
                          // 현재 사용자인 경우 "나"로 표시
                          const displayName = memberId === 'current-user-id' ? '나' : (friend?.name || '알 수 없음');
                          return (
                            <Badge key={idx} variant="secondary">
                              {displayName}
                            </Badge>
                          );
                        })}
                        {group.memberIds.length > 3 && <Badge variant="secondary">+{group.memberIds.length - 3}</Badge>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-2">일정 ({schedules.length})</p>
                      {schedules.length > 0 ? (
                        <div className="space-y-2">
                          {schedules.slice(0, 2).map((schedule) => (
                            <div key={schedule.id} className="text-sm p-2 bg-slate-50 rounded flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate">{schedule.title}</span>
                              <Badge variant="outline" className="ml-auto">
                                <Users className="w-3 h-3 mr-1" />
                                {schedule.memberIds.length}명
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">등록된 일정이 없습니다</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEventDialog(group)}>
                        <Calendar className="w-3 h-3 mr-1" />
                        일정 추가
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenCoordinationDialog(group)}>
                        <Users className="w-3 h-3 mr-1" />
                        일정 조율
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
