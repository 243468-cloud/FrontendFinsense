// FinSense — Notification Service (SOA)
import apiClient from '@/lib/apiClient';

export interface Notification {
  id: string;
  userId: string;
  type: 'budget_exceeded' | 'streak_at_risk' | 'goal_deadline' | 'reminder' | 'badge_earned';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<any[]>('/notifications');
  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.userId ?? n.user_id,
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read ?? false,
    createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
  }));
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
