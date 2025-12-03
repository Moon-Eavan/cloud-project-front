// Groups API
import apiClient from './client';
import type { Group, GroupMember } from '@/types';

// Backend response types
interface UserSummary {
  cognitoSub: string;
  name: string;
  email: string;
  isFriend: boolean | null;
  isPending: boolean | null;
}

interface GroupResponse {
  groupId: number;
  name: string;
  description?: string;
  owner: UserSummary;
  myRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  memberCount: number;
  createdAt: string;
}

interface GroupDetailResponse {
  groupId: number;
  name: string;
  description?: string;
  createdAt: string;
  members: MemberResponse[];
}

interface MemberResponse {
  memberId: number;
  user: UserSummary;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

interface MessageResponse {
  message: string;
}

// Convert backend GroupResponse to frontend Group type
const mapGroupResponseToGroup = (response: GroupResponse): Group => {
  return {
    id: response.groupId.toString(),
    name: response.name,
    memberIds: [], // Will be filled from detail response if needed
    createdBy: '', // Not provided in list response
    createdAt: new Date(response.createdAt),
  };
};

// Convert backend MemberResponse to frontend GroupMember type
const mapMemberResponseToGroupMember = (response: MemberResponse): GroupMember => {
  return {
    id: response.user.cognitoSub,
    name: response.user.name,
    email: response.user.email,
    role: response.role,
  };
};

// Convert backend GroupDetailResponse to frontend Group type
const mapGroupDetailToGroup = (response: GroupDetailResponse): Group => {
  return {
    id: response.groupId.toString(),
    name: response.name,
    memberIds: response.members.map(m => m.user.cognitoSub),
    members: response.members.map(mapMemberResponseToGroupMember),
    createdBy: response.members.find(m => m.role === 'OWNER')?.user.cognitoSub || '',
    createdAt: new Date(response.createdAt),
  };
};

export const groupsApi = {
  /**
   * Get all groups for current user
   */
  async listGroups(): Promise<Group[]> {
    try {
      const response = await apiClient.get<GroupResponse[]>('/v1/groups');

      // For each group, fetch details to get full member list
      const groupPromises = response.data.map(async (groupResponse) => {
        try {
          const detailResponse = await apiClient.get<GroupDetailResponse>(`/v1/groups/${groupResponse.groupId}`);
          return mapGroupDetailToGroup(detailResponse.data);
        } catch (error) {
          console.error(`[groupsApi.listGroups] Failed to fetch details for group ${groupResponse.groupId}:`, error);
          // Fallback: return group with basic info
          return mapGroupResponseToGroup(groupResponse);
        }
      });

      return await Promise.all(groupPromises);
    } catch (error) {
      console.error('[groupsApi.listGroups] Error fetching groups:', error);
      throw error;
    }
  },

  /**
   * Create a new group
   * Members must be from friend list
   */
  async createGroup(name: string, memberCognitoSubs: string[]): Promise<Group> {
    try {
      // 1. Create group (only name and description)
      const response = await apiClient.post<GroupResponse>('/v1/groups', {
        name,
        description: '',
      });

      const groupId = response.data.groupId;

      // 2. Invite each member separately
      if (memberCognitoSubs.length > 0) {
        const invitePromises = memberCognitoSubs.map(cognitoSub =>
          apiClient.post<MemberResponse>(`/v1/groups/${groupId}/members`, {
            userCognitoSub: cognitoSub,
            role: 'MEMBER',
          }).catch(error => {
            console.error(`[groupsApi.createGroup] Failed to invite ${cognitoSub}:`, error);
            // Don't throw - continue with other invites
            return null;
          })
        );

        await Promise.all(invitePromises);
      }

      // 3. Fetch group details to get full member information
      const detailResponse = await apiClient.get<GroupDetailResponse>(`/v1/groups/${groupId}`);
      return mapGroupDetailToGroup(detailResponse.data);
    } catch (error: any) {
      console.error('[groupsApi.createGroup] Error creating group:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '그룹 생성에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    try {
      const response = await apiClient.get<GroupDetailResponse>(`/v1/groups/${groupId}`);
      return mapGroupDetailToGroup(response.data);
    } catch (error) {
      console.error('[groupsApi.getGroup] Error fetching group:', error);
      throw error;
    }
  },

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<MemberResponse[]> {
    try {
      const response = await apiClient.get<MemberResponse[]>(`/v1/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error('[groupsApi.getGroupMembers] Error fetching group members:', error);
      throw error;
    }
  },

  /**
   * Invite member to group
   */
  async inviteMember(groupId: string, userCognitoSub: string): Promise<MemberResponse> {
    try {
      const response = await apiClient.post<MemberResponse>(`/v1/groups/${groupId}/members`, {
        userCognitoSub,
      });
      return response.data;
    } catch (error: any) {
      console.error('[groupsApi.inviteMember] Error inviting member:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '멤버 초대에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
    try {
      await apiClient.delete<MessageResponse>(`/v1/groups/${groupId}/members/${memberId}`);
    } catch (error: any) {
      console.error('[groupsApi.removeMember] Error removing member:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '멤버 제거에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Leave group
   */
  async leaveGroup(groupId: string): Promise<void> {
    try {
      await apiClient.post<MessageResponse>(`/v1/groups/${groupId}/leave`);
    } catch (error: any) {
      console.error('[groupsApi.leaveGroup] Error leaving group:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '그룹 탈퇴에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Delete group (owner only)
   */
  async deleteGroup(groupId: string): Promise<void> {
    try {
      await apiClient.delete<MessageResponse>(`/v1/groups/${groupId}`);
    } catch (error: any) {
      console.error('[groupsApi.deleteGroup] Error deleting group:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '그룹 삭제에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Update group information
   */
  async updateGroup(groupId: string, name: string, description?: string): Promise<Group> {
    try {
      const response = await apiClient.put<GroupResponse>(`/v1/groups/${groupId}`, {
        name,
        description: description || '',
      });

      // Fetch group details to get full member information
      const detailResponse = await apiClient.get<GroupDetailResponse>(`/v1/groups/${groupId}`);
      return mapGroupDetailToGroup(detailResponse.data);
    } catch (error: any) {
      console.error('[groupsApi.updateGroup] Error updating group:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '그룹 수정에 실패했습니다.';
      throw new Error(message);
    }
  },

  /**
   * Find free time slots for group members
   */
  async findFreeSlots(request: {
    groupId: number;
    userIds?: string[];
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    minDurationMinutes: number;
    workingHoursStart?: string; // HH:mm
    workingHoursEnd?: string; // HH:mm
    daysOfWeek?: number[]; // 1=월, 2=화, ..., 7=일
  }): Promise<{
    groupId: number;
    groupName: string;
    memberCount: number;
    searchPeriod: {
      startDate: string;
      endDate: string;
      minDurationMinutes: number;
    };
    freeSlots: Array<{
      startTime: string; // ISO 8601
      endTime: string; // ISO 8601
      durationMinutes: number;
      dayOfWeek: string;
    }>;
    totalFreeSlotsFound: number;
  }> {
    try {
      const response = await apiClient.post('/v1/schedules/find-free-slots', request);
      return response.data;
    } catch (error: any) {
      console.error('[groupsApi.findFreeSlots] Error finding free slots:', error);
      const message = error.response?.data?.message || error.response?.data?.error || '공강 시간 찾기에 실패했습니다.';
      throw new Error(message);
    }
  },
};
