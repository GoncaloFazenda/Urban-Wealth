import type { Notification } from '../entities/Notification';

export interface INotificationRepository {
  create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification>;
  findByUser(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
