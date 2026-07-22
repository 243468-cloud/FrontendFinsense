// FinSense — Group Service
import apiClient from '@/lib/apiClient';
import type { Group, CreateGroupDTO, GroupExpense, GroupExpenseDTO, DebtSummary } from '@/types/group.types';

// ─── Shape normalizer: backend → frontend ───
function mapGroup(raw: any): Group {
  const members = (raw.members ?? []).map((m: any) => ({
    userId: m.userId ?? m.user?.id ?? m.id,
    name: m.user?.name ?? m.name ?? 'Miembro',
    avatar: m.user?.avatar ?? m.avatar,
    balance: m.balance ?? 0,
  }));
  return {
    id: raw.id,
    name: raw.name,
    emoji: raw.emoji ?? '👥',
    description: raw.description,
    members,
    createdBy: raw.createdBy ?? raw.created_by,
    createdAt: raw.createdAt ?? raw.created_at,
    totalExpenses: raw.totalExpenses ?? 0,
    lastActivity: raw.lastActivity ?? raw.updatedAt ?? raw.createdAt ?? raw.created_at,
  };
}

function mapExpense(e: any, groupId: string): GroupExpense {
  return {
    id: e.id,
    groupId: e.groupId ?? groupId,
    title: e.description ?? e.title,
    amount: Number(e.amount),
    paidBy: e.paidBy,
    paidByName: e.user?.name ?? 'Miembro',
    splitBetween: Array.isArray(e.splitBetween)
      ? e.splitBetween
      : JSON.parse(e.splitBetween ?? '[]'),
    splitType: 'equal',
    categoryId: 'other',
    date: e.date ?? e.createdAt ?? new Date().toISOString(),
    createdAt: e.createdAt ?? e.date ?? new Date().toISOString(),
  };
}

export async function getGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<any[]>('/groups');
  return (data ?? []).map(mapGroup);
}

export async function getGroup(id: string): Promise<Group> {
  const { data } = await apiClient.get<any>(`/groups/${id}`);
  return mapGroup(data);
}

export async function createGroup(dto: CreateGroupDTO): Promise<Group> {
  const { data } = await apiClient.post<any>('/groups', {
    name: dto.name,
    memberIds: dto.memberIds,
  });
  return mapGroup(data);
}

export async function getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
  const { data } = await apiClient.get<any[]>(`/groups/${groupId}/expenses`);
  return (data ?? []).map((e: any) => mapExpense(e, groupId));
}

export async function addGroupExpense(groupId: string, dto: GroupExpenseDTO): Promise<GroupExpense> {
  const { data } = await apiClient.post<any>(`/groups/${groupId}/expenses`, {
    amount: dto.amount,
    description: dto.description,
    splitBetween: dto.splitBetween,
    paidBy: dto.paidBy,
  });
  return mapExpense(data, groupId);
}

/** Debt calculation lives in the backend — GET /groups/:id/debts/simplified */
export async function getSimplifiedDebts(groupId: string): Promise<DebtSummary[]> {
  const { data } = await apiClient.get<any[]>(`/groups/${groupId}/debts/simplified`);
  return (data ?? []).map((d: any) => ({
    from: d.from?.id ?? d.from,
    fromName: d.from?.name ?? d.fromName ?? 'Miembro',
    to: d.to?.id ?? d.to,
    toName: d.to?.name ?? d.toName ?? 'Miembro',
    amount: d.amount,
  }));
}

export async function addGroupMember(groupId: string, userId: string): Promise<Group> {
  const { data } = await apiClient.post<any>(`/groups/${groupId}/members`, { userId });
  return mapGroup(data);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<Group> {
  const { data } = await apiClient.delete<any>(`/groups/${groupId}/members/${userId}`);
  return mapGroup(data);
}
