// Groups API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Group, GroupSchedule, Schedule, ScheduleCoordination, MemberScheduleInfo } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const groupsApi = {
  /**
   * Get all groups for current user
   * TODO: Replace with axios.get('/api/groups')
   */
  async listGroups(): Promise<Group[]> {
    await delay(300);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    return store.groups.filter((g) => g.memberIds.includes(store.currentUser!.id));
  },

  /**
   * Create a new group (spec 5.2)
   * Members must be from friend list
   * TODO: Replace with axios.post('/api/groups', groupData)
   */
  async createGroup(name: string, memberIds: string[]): Promise<Group> {
    await delay(400);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // Validate that all members are friends
    const friendIds = store.friends.filter((f) => f.status === 'accepted').map((f) => f.id);

    for (const memberId of memberIds) {
      if (memberId !== store.currentUser.id && !friendIds.includes(memberId)) {
        throw new Error('그룹 멤버는 친구 목록에 있는 사용자만 선택할 수 있습니다.');
      }
    }

    // Ensure current user is in the group
    const allMemberIds = Array.from(new Set([store.currentUser.id, ...memberIds]));

    const newGroup: Group = {
      id: generateId(),
      name,
      memberIds: allMemberIds,
      createdBy: store.currentUser.id,
      createdAt: new Date(),
    };

    store.groups.push(newGroup);

    return newGroup;
  },

  /**
   * Get group by ID
   * TODO: Replace with axios.get(`/api/groups/${groupId}`)
   */
  async getGroup(groupId: string): Promise<Group> {
    await delay(200);

    const group = store.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    return group;
  },

  /**
   * Create group schedule (spec 6.1 - direct add)
   * Creates schedule in each member's calendar
   * Sends notifications to members
   * TODO: Replace with axios.post(`/api/groups/${groupId}/schedules`, scheduleData)
   */
  async createGroupSchedule(
    groupId: string,
    scheduleData: Omit<GroupSchedule, 'id' | 'groupId' | 'createdBy' | 'createdAt'>
  ): Promise<GroupSchedule> {
    await delay(500);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const group = store.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    const newGroupSchedule: GroupSchedule = {
      ...scheduleData,
      id: generateId(),
      groupId,
      createdBy: store.currentUser.id,
      createdAt: new Date(),
    };

    store.groupSchedules.push(newGroupSchedule);

    // Create schedule in each member's calendar
    for (const memberId of scheduleData.memberIds) {
      const memberSchedule: Schedule = {
        id: generateId(),
        title: scheduleData.title,
        description: scheduleData.description || '',
        start: scheduleData.start,
        end: scheduleData.end,
        location: scheduleData.location,
        isCompleted: false,
        calendarId: 'cal-local', // Add to local calendar
      };

      store.schedules.push(memberSchedule);

      // TODO: Create notification for each member (except creator)
      // This will be handled by notificationsApi
    }

    return newGroupSchedule;
  },

  /**
   * Get member schedules for coordination (spec 6.2.2)
   * Returns schedules within the period for selected members
   * TODO: Replace with axios.post('/api/groups/coordinate/schedules', coordinationData)
   */
  async getMemberSchedulesForCoordination(
    coordination: ScheduleCoordination
  ): Promise<MemberScheduleInfo[]> {
    await delay(500);

    const { memberIds, period } = coordination;
    const memberSchedules: MemberScheduleInfo[] = [];

    for (const memberId of memberIds) {
      // Find user from either currentUser, users, or friends
      let userName = '알 수 없음';

      if (memberId === store.currentUser?.id) {
        userName = store.currentUser.name;
      } else {
        const user = store.users.find((u) => u.id === memberId);
        if (user) {
          userName = user.name;
        } else {
          const friend = store.friends.find((f) => f.id === memberId);
          if (friend) {
            userName = friend.name || '알 수 없음';
          }
        }
      }

      // Get user's schedules within the period
      // TODO: When backend is connected, this should query the specific user's schedules
      // For now, we simulate different schedules for each member for testing
      let userSchedules = store.schedules.filter((s) => {
        const scheduleStart = new Date(s.start);
        const scheduleEnd = new Date(s.end);

        return (
          (scheduleStart >= period.start && scheduleStart <= period.end) ||
          (scheduleEnd >= period.start && scheduleEnd <= period.end) ||
          (scheduleStart <= period.start && scheduleEnd >= period.end)
        );
      });

      // Simulate different schedules for different members (for testing only)
      // In production, backend will return each user's actual schedules
      if (memberId === 'current-user-id') {
        // Current user sees their own schedules (cal-google and cal-local)
        userSchedules = userSchedules.filter(s =>
          s.calendarId === 'cal-google' || s.calendarId === 'cal-local'
        );
      } else if (memberId === 'friend-1') {
        // Friend 1 has some schedules
        userSchedules = userSchedules.filter(s =>
          s.calendarId === 'cal-local' || s.calendarId === 'cal-ecampus'
        );
      } else if (memberId === 'friend-2') {
        // Friend 2 has different schedules
        userSchedules = userSchedules.filter(s => s.calendarId === 'cal-ecampus');
      } else {
        // Other friends have minimal schedules
        userSchedules = userSchedules.slice(0, 1);
      }

      memberSchedules.push({
        userId: memberId,
        userName,
        schedules: userSchedules,
      });
    }

    return memberSchedules;
  },

  /**
   * Get schedules for a group
   * TODO: Replace with axios.get(`/api/groups/${groupId}/schedules`)
   */
  async getGroupSchedules(groupId: string): Promise<GroupSchedule[]> {
    await delay(300);

    return store.groupSchedules.filter((s) => s.groupId === groupId);
  },

  /**
   * Delete group
   * TODO: Replace with axios.delete(`/api/groups/${groupId}`)
   */
  async deleteGroup(groupId: string): Promise<void> {
    await delay(300);

    const groupIndex = store.groups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    // Only creator can delete
    if (store.groups[groupIndex].createdBy !== store.currentUser?.id) {
      throw new Error('그룹을 삭제할 권한이 없습니다.');
    }

    store.groups.splice(groupIndex, 1);

    // Also delete associated group schedules
    store.groupSchedules = store.groupSchedules.filter((s) => s.groupId !== groupId);
  },
};
