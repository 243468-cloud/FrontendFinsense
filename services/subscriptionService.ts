import apiClient from '@/lib/apiClient';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled';
  iconUrl?: string;
  category: string;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data } = await apiClient.get<Subscription[]>('/subscriptions');
  return data;
}

export async function createSubscription(sub: Omit<Subscription, 'id' | 'status'>): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>('/subscriptions', sub);
  return data;
}

export async function updateSubscription(id: string, sub: Partial<Subscription>): Promise<Subscription> {
  const { data } = await apiClient.put<Subscription>(`/subscriptions/${id}`, sub);
  return data;
}

export async function deleteSubscription(id: string): Promise<void> {
  await apiClient.delete(`/subscriptions/${id}`);
}
