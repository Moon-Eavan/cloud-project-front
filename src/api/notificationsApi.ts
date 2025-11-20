// Notifications API
// Currently uses mock in-memory storage
// TODO: Replace with real axios-based HTTP calls to backend

import type { Notification, NotificationType } from '@/types';
import { store, generateId } from '@/mocks/mockStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationsApi = {
  /**
   * Get all notifications for current user
   * TODO: Replace with axios.get('/api/notifications')
   */
  async listNotifications(): Promise<Notification[]> {
    await delay(300);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    return store.notifications
      .filter((n) => n.userId === store.currentUser!.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * Get unread notifications count
   * TODO: Replace with axios.get('/api/notifications/unread/count')
   */
  async getUnreadCount(): Promise<number> {
    await delay(200);

    if (!store.currentUser) {
      return 0;
    }

    return store.notifications.filter(
      (n) => n.userId === store.currentUser!.id && !n.read
    ).length;
  },

  /**
   * Mark notification as read
   * TODO: Replace with axios.patch(`/api/notifications/${notificationId}/read`)
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    await delay(200);

    const notification = store.notifications.find((n) => n.id === notificationId);
    if (!notification) {
      throw new Error('알림을 찾을 수 없습니다.');
    }

    if (notification.userId !== store.currentUser?.id) {
      throw new Error('이 알림에 접근할 권한이 없습니다.');
    }

    notification.read = true;
    return notification;
  },

  /**
   * Mark all notifications as read
   * TODO: Replace with axios.post('/api/notifications/read-all')
   */
  async markAllAsRead(): Promise<void> {
    await delay(300);

    if (!store.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    store.notifications.forEach((n) => {
      if (n.userId === store.currentUser!.id) {
        n.read = true;
      }
    });
  },

  /**
   * Create a notification (internal use for triggering events)
   * TODO: This will be handled by backend when events occur
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    actionUrl?: string
  ): Promise<Notification> {
    await delay(200);

    const newNotification: Notification = {
      id: generateId(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      relatedId,
      actionUrl,
    };

    store.notifications.push(newNotification);
    return newNotification;
  },

  /**
   * Delete notification
   * TODO: Replace with axios.delete(`/api/notifications/${notificationId}`)
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await delay(200);

    const notificationIndex = store.notifications.findIndex((n) => n.id === notificationId);
    if (notificationIndex === -1) {
      throw new Error('알림을 찾을 수 없습니다.');
    }

    if (store.notifications[notificationIndex].userId !== store.currentUser?.id) {
      throw new Error('이 알림을 삭제할 권한이 없습니다.');
    }

    store.notifications.splice(notificationIndex, 1);
  },
};
