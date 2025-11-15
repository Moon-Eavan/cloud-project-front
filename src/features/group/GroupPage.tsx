import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';

import { Group, Friend, GroupSchedule } from '../../types';
import { useScheduleContext } from '../../store/ScheduleContext';
import * as groupApi from '../../api/groupApi';
import * as friendApi from '../../api/friendApi';
import ScheduleCoordinator from './ScheduleCoordinator';
import { getTodayDate, getCurrentHour, getCurrentHourPlus } from '../../lib/utils';

export default function GroupPage() {
  const { createSchedule } = useScheduleContext();

  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupSchedules, setGroupSchedules] = useState<Map<string, GroupSchedule[]>>(new Map());

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCoordinatorOpen, setIsCoordinatorOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    selectedMemberIds: [] as string[],
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: getTodayDate(),
    startTime: getCurrentHour(),
    endTime: getCurrentHourPlus(2),
    location: '',
    memberIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [groupsData, friendsData] = await Promise.all([groupApi.getGroups(), friendApi.getFriends()]);
    setGroups(groupsData);
    setFriends(friendsData);

    // 각 그룹의 일정 로드
    const schedulesMap = new Map<string, GroupSchedule[]>();
    for (const group of groupsData) {
      const schedules = await groupApi.getGroupSchedules(group.id);
      schedulesMap.set(group.id, schedules);
    }
    setGroupSchedules(schedulesMap);
  };

  // spec.md 규칙: 친구로 추가된 사용자만 그룹 멤버로 선택 가능
  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('그룹 이름을 입력해주세요.');
      return;
    }

    if (newGroup.selectedMemberIds.length === 0) {
      toast.error('최소 1명의 멤버를 선택해주세요.');
      return;
    }

    const group = await groupApi.createGroup({
      name: newGroup.name,
      description: newGroup.description || undefined,
      memberIds: newGroup.selectedMemberIds,
    });

    setGroups([...groups, group]);
    setGroupSchedules(prev => new Map(prev).set(group.id, []));
    toast.success(`"${group.name}" 그룹이 생성되었습니다.`);
    setNewGroup({ name: '', description: '', selectedMemberIds: [] });
    setIsGroupDialogOpen(false);
  };

  // spec.md 규칙: 일정 추가
  // - 선택된 멤버 각각의 캘린더에 schedule로 생성
  // - 각 멤버에게 알림 발송
  // - 그룹 탭에서도 조회 가능
  const handleCreateEvent = async () => {
    if (!selectedGroup) return;

    if (!newEvent.title.trim()) {
      toast.error('일정 제목을 입력해주세요.');
      return;
    }

    if (newEvent.memberIds.length === 0) {
      toast.error('최소 1명의 참여 멤버를 선택해주세요.');
      return;
    }

    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

    // 내 캘린더에 일정 추가 (Context를 통해 상태 업데이트)
    const mySchedule = await createSchedule({
      title: newEvent.title,
      description: newEvent.description || undefined,
      start: startDateTime,
      end: endDateTime,
      location: newEvent.location || undefined,
      color: 'blue',
    });

    // 그룹 일정 정보 저장
    const groupSchedule: GroupSchedule = {
      id: Date.now().toString(),
      groupId: selectedGroup.id,
      scheduleId: mySchedule.id,
      title: newEvent.title,
      description: newEvent.description || undefined,
      location: newEvent.location || undefined,
      start: startDateTime,
      end: endDateTime,
      participants: newEvent.memberIds,
      createdBy: 'current-user',
      createdAt: new Date(),
    };

    // 그룹 일정 목록 업데이트
    setGroupSchedules(prev => {
      const newMap = new Map(prev);
      const currentSchedules = newMap.get(selectedGroup.id) || [];
      newMap.set(selectedGroup.id, [...currentSchedules, groupSchedule]);
      return newMap;
    });

    toast.success(`"${newEvent.title}" 일정이 생성되었습니다. 참여 멤버에게 알림이 발송됩니다.`);
    resetEventForm();
    setIsEventDialogOpen(false);
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: getTodayDate(),
      startTime: getCurrentHour(),
      endTime: getCurrentHourPlus(2),
      location: '',
      memberIds: [],
    });
  };

  const handleDeleteGroup = async (groupId: string) => {
    await groupApi.deleteGroup(groupId);
    setGroups(groups.filter(g => g.id !== groupId));
    setGroupSchedules(prev => {
      const newMap = new Map(prev);
      newMap.delete(groupId);
      return newMap;
    });
    toast.success('그룹이 삭제되었습니다.');
  };

  const handleOpenEventDialog = (group: Group) => {
    setSelectedGroup(group);
    resetEventForm();
    setIsEventDialogOpen(true);
  };

  const handleOpenCoordinator = (group: Group) => {
    setSelectedGroup(group);
    setIsCoordinatorOpen(true);
  };

  // spec.md 규칙: 일정 조율 후 일정 생성
  // - start, end: 사용자가 선택한 시간
  // - members: 조율에 선택했던 멤버들
  const handleCoordinatorTimeSelected = (data: {
    selectedMembers: string[];
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    setNewEvent({
      title: '',
      description: '',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: '',
      memberIds: data.selectedMembers,
    });
    setIsCoordinatorOpen(false);
    setIsEventDialogOpen(true);
  };

  const toggleMemberSelection = (memberId: string) => {
    setNewGroup(prev => ({
      ...prev,
      selectedMemberIds: prev.selectedMemberIds.includes(memberId)
        ? prev.selectedMemberIds.filter(id => id !== memberId)
        : [...prev.selectedMemberIds, memberId],
    }));
  };

  const toggleEventMember = (memberId: string) => {
    setNewEvent(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const getGroupScheduleCount = (groupId: string) => {
    return groupSchedules.get(groupId)?.length || 0;
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
              <DialogDescription>새로운 그룹을 생성합니다. 친구 목록에서 멤버를 선택하세요.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="group-name">그룹 이름</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="그룹 이름을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="group-description">그룹 설명</Label>
                <Textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="그룹 설명을 입력하세요"
                />
              </div>
              <div>
                <Label>
                  멤버 선택 ({newGroup.selectedMemberIds.length}/{friends.length})
                </Label>
                <p className="text-xs text-gray-500 mb-2">친구 목록에서 그룹에 추가할 멤버를 선택하세요.</p>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                  {friends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleMemberSelection(friend.userId)}
                    >
                      <Checkbox
                        checked={newGroup.selectedMemberIds.includes(friend.userId)}
                        onCheckedChange={() => toggleMemberSelection(friend.userId)}
                      />
                      <label className="cursor-pointer flex-1 text-sm">{friend.name}</label>
                    </div>
                  ))}
                </div>
                {friends.length === 0 && <p className="text-sm text-gray-400">친구를 먼저 추가해주세요.</p>}
              </div>
              <Button onClick={handleCreateGroup} className="w-full bg-blue-500 hover:bg-blue-600">
                생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 일정 생성 다이얼로그 */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 일정 생성 - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>그룹 일정을 생성합니다. 선택된 멤버의 캘린더에 일정이 추가됩니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">일정 제목</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="event-description">일정 설명</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="일정 설명을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="event-date">날짜</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-start-time">시작 시간</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-end-time">종료 시간</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-location">장소</Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="장소를 입력하세요"
              />
            </div>
            <div>
              <Label>
                참여 멤버 선택 ({newEvent.memberIds.length}/{selectedGroup?.members.length || 0})
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-40 overflow-y-auto">
                {selectedGroup?.members.map(member => (
                  <div
                    key={member.userId}
                    className="flex items-center space-x-3 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleEventMember(member.userId)}
                  >
                    <Checkbox
                      checked={newEvent.memberIds.includes(member.userId)}
                      onCheckedChange={() => toggleEventMember(member.userId)}
                    />
                    <label className="cursor-pointer flex-1 text-sm">{member.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateEvent} className="w-full bg-blue-500 hover:bg-blue-600">
              일정 생성
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 일정 조율 다이얼로그 */}
      <Dialog open={isCoordinatorOpen} onOpenChange={setIsCoordinatorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>일정 조율 - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>그룹원들과 일정을 조율합니다.</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <ScheduleCoordinator
              groupMembers={friends.filter(f => selectedGroup.members.some(m => m.userId === f.userId))}
              onTimeSelected={handleCoordinatorTimeSelected}
              onCancel={() => setIsCoordinatorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 그룹 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card
            key={group.id}
            className="hover:shadow-xl transition-all bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200 rounded-2xl"
          >
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
                    {group.members.map(member => (
                      <Badge key={member.userId} variant="secondary">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">일정 ({getGroupScheduleCount(group.id)})</p>
                  {getGroupScheduleCount(group.id) > 0 ? (
                    <div className="space-y-2">
                      {groupSchedules
                        .get(group.id)
                        ?.slice(0, 2)
                        .map(schedule => (
                          <div key={schedule.id} className="text-sm p-2 bg-slate-50 rounded flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span className="truncate">{schedule.title}</span>
                            <Badge variant="outline" className="ml-auto">
                              <Users className="w-3 h-3 mr-1" />
                              {schedule.participants.length}명
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">등록된 일정이 없습니다</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEventDialog(group)}>
                    <Calendar className="w-3 h-3 mr-1" />
                    일정 추가
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenCoordinator(group)}>
                    일정 조율
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">아직 생성된 그룹이 없습니다.</p>
          <p className="text-sm text-gray-400">상단의 "그룹 생성" 버튼을 눌러 새 그룹을 만드세요.</p>
        </div>
      )}
    </div>
  );
}
