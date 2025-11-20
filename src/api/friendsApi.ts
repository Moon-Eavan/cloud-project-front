// Friends API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Friend, FriendRequest, User } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const friendsApi = {
  /**
   * Get all friends for current user
   * TODO: Replace with axios.get('/api/friends')
   */
  async listFriends(): Promise<Friend[]> {
    await delay(300);
    return store.friends.filter((f) => f.status === 'accepted');
  },

  /**
   * Send friend request by user ID or email
   * TODO: Replace with axios.post('/api/friends/request', { userId or email })
   */
  async sendFriendRequest(userIdOrEmail: string): Promise<FriendRequest> {
    await delay(400);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // Find target user
    const targetUser = store.users.find(
      (u) => u.id === userIdOrEmail || u.email === userIdOrEmail
    );

    if (!targetUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    if (targetUser.id === store.currentUser.id) {
      throw new Error('자기 자신에게는 친구 요청을 보낼 수 없습니다.');
    }

    // Check if already friends
    const existingFriend = store.friends.find(
      (f) => f.id === targetUser.id && f.status === 'accepted'
    );
    if (existingFriend) {
      throw new Error('이미 친구입니다.');
    }

    // Check if request already exists
    const existingRequest = store.friendRequests.find(
      (r) =>
        r.fromUserId === store.currentUser!.id &&
        r.toUserId === targetUser.id &&
        r.status === 'pending'
    );
    if (existingRequest) {
      throw new Error('이미 친구 요청을 보냈습니다.');
    }

    const newRequest: FriendRequest = {
      id: generateId(),
      fromUserId: store.currentUser.id,
      toUserId: targetUser.id,
      status: 'pending',
      createdAt: new Date(),
    };

    store.friendRequests.push(newRequest);

    // Create notification for target user (spec 7.2)
    // This will be handled by notificationsApi

    return newRequest;
  },

  /**
   * Accept friend request
   * TODO: Replace with axios.post(`/api/friends/requests/${requestId}/accept`)
   */
  async acceptFriendRequest(requestId: string): Promise<Friend> {
    await delay(400);

    const request = store.friendRequests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('친구 요청을 찾을 수 없습니다.');
    }

    if (request.toUserId !== store.currentUser?.id) {
      throw new Error('이 요청을 수락할 권한이 없습니다.');
    }

    // Update request status
    request.status = 'accepted';

    // Add as friend
    const fromUser = store.users.find((u) => u.id === request.fromUserId);
    if (!fromUser) {
      throw new Error('요청한 사용자를 찾을 수 없습니다.');
    }

    const newFriend: Friend = {
      id: fromUser.id,
      name: fromUser.name,
      email: fromUser.email,
      profileImage: fromUser.profileImage,
      status: 'accepted',
    };

    store.friends.push(newFriend);

    return newFriend;
  },

  /**
   * Reject friend request
   * TODO: Replace with axios.post(`/api/friends/requests/${requestId}/reject`)
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    await delay(300);

    const request = store.friendRequests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('친구 요청을 찾을 수 없습니다.');
    }

    if (request.toUserId !== store.currentUser?.id) {
      throw new Error('이 요청을 거절할 권한이 없습니다.');
    }

    request.status = 'rejected';
  },

  /**
   * Remove friend
   * TODO: Replace with axios.delete(`/api/friends/${friendId}`)
   */
  async removeFriend(friendId: string): Promise<void> {
    await delay(300);

    const friendIndex = store.friends.findIndex((f) => f.id === friendId);
    if (friendIndex === -1) {
      throw new Error('친구를 찾을 수 없습니다.');
    }

    store.friends.splice(friendIndex, 1);
  },

  /**
   * Get pending friend requests (received)
   * TODO: Replace with axios.get('/api/friends/requests/pending')
   */
  async getPendingRequests(): Promise<FriendRequest[]> {
    await delay(300);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    return store.friendRequests.filter(
      (r) => r.toUserId === store.currentUser!.id && r.status === 'pending'
    );
  },
};
