// FinSense — Notification Service (SOA)
import apiClient from '@/lib/apiClient';

export interface AppNotification {
  id: string;
  type: 'budget' | 'reminder' | 'system' | 'streak' | 'group_invite';
  title: string;
  message: string;
  read: boolean;
  date: string;
}

function mapNotification(n: any): AppNotification {
  let mappedType: AppNotification['type'] = 'system';
  if (n.type === 'budget_exceeded') mappedType = 'budget';
  else if (n.type === 'reminder') mappedType = 'reminder';
  else if (n.type === 'streak_at_risk') mappedType = 'streak';
  else if (n.type === 'group_invite') mappedType = 'group_invite';

  return {
    id: n.id,
    type: mappedType,
    title: n.title,
    message: n.body || n.message || '',
    read: n.read,
    date: n.createdAt || n.date || new Date().toISOString(),
  };
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<any[]>('/notifications');
  return (data ?? []).map(mapNotification);
}

export async function markAsRead(id: string): Promise<AppNotification[]> {
  await apiClient.patch(`/notifications/${id}/read`);
  return getNotifications();
}

export async function markAllAsRead(): Promise<AppNotification[]> {
  await apiClient.patch('/notifications/read-all');
  return getNotifications();
}

export async function deleteNotification(id: string): Promise<AppNotification[]> {
  await apiClient.delete(`/notifications/${id}`);
  return getNotifications();
}

export async function createNotification(
  type: AppNotification['type'],
  title: string,
  message: string
): Promise<AppNotification> {
  const backendType = type === 'budget' ? 'budget_exceeded' : 'reminder';
  const { data } = await apiClient.post<any>('/notifications', {
    type: backendType,
    title,
    body: message,
  });
  return mapNotification(data);
}
