import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { groupsApi, friendsApi, schedulesApi, calendarsApi } from '@/api';
import type { Group, GroupSchedule, Friend, Schedule } from '@/types';
import When2MeetScheduler from '@/components/When2MeetScheduler';

interface GroupsPageProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

export default function GroupsPage({ schedules, setSchedules }: GroupsPageProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSchedules, setGroupSchedules] = useState<GroupSchedule[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const currentHour = new Date().getHours();
    const hours = Math.min(currentHour + 2, 23).toString().padStart(2, '0');
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
      setIsLoading(true);

      // Load friends and groups in parallel
      const [friendsData, groupsData] = await Promise.all([
        friendsApi.listFriends(),
        groupsApi.listGroups(),
      ]);

      setFriends(friendsData);
      setGroups(groupsData);

      // Load all group schedules
      // Note: Group schedules are not yet implemented in backend
      // const allSchedules: GroupSchedule[] = [];
      // for (const group of groupsData) {
      //   const schedules = await groupsApi.getGroupSchedules(group.id);
      //   allSchedules.push(...schedules);
      // }
      // setGroupSchedules(allSchedules);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.message || '데이터 로드 실패');
    } finally {
      setIsLoading(false);
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

      // Get user's first calendar for the schedule
      const calendars = await calendarsApi.listCalendars();
      const defaultCalendar = calendars.find(c => c.type === 'local') || calendars[0];

      if (!defaultCalendar) {
        toast.error('캘린더가 없습니다. 먼저 캘린더를 생성해주세요.');
        return;
      }

      // Create schedule with groupId - backend will automatically add to all group members' calendars
      const created = await schedulesApi.createSchedule(
        {
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          start: startDateTime,
          end: endDateTime,
          isCompleted: false,
          calendarId: defaultCalendar.id,
        },
        parseInt(selectedGroup.id) // Pass groupId to create group schedule
      );

      // Add to local state
      setSchedules((prev) => [...prev, created]);

      // Add to group schedules state
      const userData = localStorage.getItem('user_data');
      const currentUserId = userData ? JSON.parse(userData).id : '';

      const groupSchedule: GroupSchedule = {
        id: created.id,
        groupId: selectedGroup.id,
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        start: startDateTime,
        end: endDateTime,
        memberIds: selectedGroup.members?.map(m => m.id) || [],
        createdBy: currentUserId,
        createdAt: new Date(),
      };

      setGroupSchedules((prev) => [...prev, groupSchedule]);

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
      toast.success('그룹 일정이 생성되었습니다. 모든 멤버의 캘린더에 추가됩니다.');
    } catch (error: any) {
      console.error('Failed to create group event:', error);
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

  const handleOpenEventDialog = async (group: Group) => {
    // Fetch fresh group details to ensure we have member information
    try {
      const freshGroup = await groupsApi.getGroup(group.id);
      setSelectedGroup(freshGroup);
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
    } catch (error: any) {
      console.error('Failed to load group details:', error);
      toast.error('그룹 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleOpenCoordinationDialog = async (group: Group) => {
    // Fetch fresh group details to ensure we have member information
    try {
      setCoordination({ ...coordination, isLoading: true });

      const freshGroup = await groupsApi.getGroup(group.id);
      setSelectedGroup(freshGroup);

      // Get current user ID from localStorage
      const userData = localStorage.getItem('user_data');
      const parsedUserData = userData ? JSON.parse(userData) : null;
      console.log('[GroupsPage] Parsed user data:', parsedUserData);

      const currentUserId = parsedUserData?.cognitoSub;

      console.log('[GroupsPage] Current user ID:', currentUserId);
      console.log('[GroupsPage] Group members:', freshGroup.members);
      console.log('[GroupsPage] Available schedules:', schedules.length);

      // Fetch schedules for all group members
      const memberSchedulePromises = freshGroup.members?.map(async (member) => {
        try {
          console.log(`[GroupsPage] Checking member ${member.id} (${member.name}) vs currentUserId ${currentUserId}`);

          // Fetch schedules for this member
          // Note: We need to fetch schedules for each member - this might require backend support
          // For now, we'll only fetch current user's schedules
          if (member.id === currentUserId) {
            console.log(`[GroupsPage] ✓ Match! Loading schedules for ${member.name}:`, schedules.length);
            return {
              userId: member.id,
              userName: member.name,
              schedules: schedules, // Use already loaded schedules
            };
          } else {
            console.log(`[GroupsPage] ✗ No match for ${member.name}`);
            // For other members, return empty schedules (backend needs to support this)
            return {
              userId: member.id,
              userName: member.name,
              schedules: [], // TODO: Backend should provide member schedules API
            };
          }
        } catch (error) {
          console.error(`Failed to fetch schedules for member ${member.id}:`, error);
          return {
            userId: member.id,
            userName: member.name,
            schedules: [],
          };
        }
      }) || [];

      const memberSchedulesData = await Promise.all(memberSchedulePromises);

      setCoordination({
        memberSchedules: memberSchedulesData,
        isLoading: false,
      });
      setIsCoordinationDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load group details:', error);
      toast.error('그룹 정보를 불러오는데 실패했습니다.');
      setCoordination({ memberSchedules: [], isLoading: false });
    }
  };

  const [freeSlots, setFreeSlots] = useState<Array<{
    startTime: string;
    endTime: string;
    durationMinutes: number;
    dayOfWeek: string;
  }>>([]);
  const [isSearchingFreeSlots, setIsSearchingFreeSlots] = useState(false);

  const handleFindFreeSlots = async () => {
    if (!selectedGroup) return;

    try {
      setIsSearchingFreeSlots(true);

      // 오늘부터 14일(2주)간의 공강 시간 찾기
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);

      console.log('[GroupsPage] Searching free slots from', today.toISOString().split('T')[0], 'to', twoWeeksLater.toISOString().split('T')[0]);

      const result = await groupsApi.findFreeSlots({
        groupId: parseInt(selectedGroup.id),
        startDate: today.toISOString().split('T')[0],
        endDate: twoWeeksLater.toISOString().split('T')[0],
        minDurationMinutes: 60, // 최소 1시간
        workingHoursStart: '09:00',
        workingHoursEnd: '22:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // 월~일 (모든 요일)
      });

      console.log('[GroupsPage] Free slots result:', result);
      setFreeSlots(result.freeSlots);

      if (result.totalFreeSlotsFound === 0) {
        toast.warning('2주 이내에 공강 시간이 없습니다. 다른 조건으로 검색해보세요.');
      } else {
        toast.success(`${result.totalFreeSlotsFound}개의 공강 시간을 찾았습니다! (모든 멤버가 비어있는 시간)`);
      }
    } catch (error: any) {
      console.error('Failed to find free slots:', error);
      toast.error(error.message || '공강 시간 찾기 실패');
    } finally {
      setIsSearchingFreeSlots(false);
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
              <div className="flex items-center justify-between mb-2">
                <Label>참여 멤버 선택 ({newEvent.members.length}/{selectedGroup?.members?.length || 0})</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFindFreeSlots}
                  disabled={isSearchingFreeSlots}
                  className="text-xs"
                >
                  <Search className="w-3 h-3 mr-1" />
                  {isSearchingFreeSlots ? '검색 중...' : '비어있는 시간 찾기'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                {selectedGroup?.members?.map((member) => {
                  return (
                    <label
                      key={member.id}
                      className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={newEvent.members.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewEvent({
                              ...newEvent,
                              members: [...newEvent.members, member.id],
                            });
                          } else {
                            setNewEvent({
                              ...newEvent,
                              members: newEvent.members.filter((m) => m !== member.id),
                            });
                          }
                        }}
                      />
                      <span className="flex-1 text-sm">{member.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Free Slots Results */}
            {freeSlots.length > 0 && (
              <div className="border rounded-lg p-3 bg-green-50">
                <div className="mb-2">
                  <Label className="text-green-800 font-semibold block">
                    공강 시간 ({freeSlots.length}개)
                  </Label>
                  <p className="text-xs text-green-700 mt-1">
                    모든 그룹 멤버가 비어있는 시간입니다. 클릭하여 선택하세요.
                  </p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {freeSlots.map((slot, index) => {
                    const start = new Date(slot.startTime);
                    const end = new Date(slot.endTime);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setNewEvent({
                            ...newEvent,
                            date: start.toISOString().split('T')[0],
                            startTime: start.toTimeString().slice(0, 5),
                            endTime: end.toTimeString().slice(0, 5),
                          });
                        }}
                        className="w-full text-left p-2 bg-white border border-green-200 rounded hover:bg-green-100 transition-colors"
                      >
                        <div className="text-sm font-medium text-green-900">
                          {slot.dayOfWeek} - {start.toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-xs text-green-700">
                          {start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~{' '}
                          {end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          ({slot.durationMinutes}분)
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                groupId={selectedGroup?.id}
                groupMembers={
                  selectedGroup?.members?.map((member) => ({
                    id: member.id,
                    name: member.name,
                  })) || []
                }
                memberSchedules={coordination.memberSchedules}
                currentUserId={(() => {
                  const userData = localStorage.getItem('user_data');
                  return userData ? JSON.parse(userData).cognitoSub : null;
                })()}
                onTimeSelected={handleTimeSelected}
                onBack={() => setIsCoordinationDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>로딩 중...</p>
          </div>
        ) : groups.length === 0 ? (
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
                      <p className="text-sm text-slate-500 mb-2">멤버 ({group.members?.length || group.memberIds.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {(group.members?.slice(0, 3) || []).map((member, idx) => (
                          <Badge key={idx} variant="secondary">
                            {member.name}
                          </Badge>
                        ))}
                        {(group.members?.length || 0) > 3 && <Badge variant="secondary">+{(group.members?.length || 0) - 3}</Badge>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-2">일정 ({schedules.length})</p>
                      {schedules.length > 0 ? (
                        <div className="space-y-2">
                          {schedules.slice(0, 2).map((schedule) => {
                            // Get member names for this schedule
                            const scheduleMembers = group.members?.filter(m =>
                              schedule.memberIds.includes(m.id)
                            ) || [];
                            const memberNames = scheduleMembers.map(m => m.name).join(', ');

                            return (
                              <div key={schedule.id} className="text-sm p-2 bg-slate-50 rounded flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span className="truncate">{schedule.title}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="ml-auto">
                                        <Badge variant="outline">
                                          <Users className="w-3 h-3 mr-1" />
                                          {schedule.memberIds.length}명
                                        </Badge>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-xs">
                                      <p>{memberNames || '멤버 정보 없음'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            );
                          })}
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
