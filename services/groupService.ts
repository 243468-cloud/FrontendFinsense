// FinSense — Group Service (SOA)
import apiClient from '@/lib/apiClient';
import type { Group, CreateGroupDTO, GroupExpense, GroupExpenseDTO, DebtSummary } from '@/types/group.types';
import { MOCK_GROUPS, MOCK_GROUP_EXPENSES } from '@/lib/mockData';

const USE_MOCK = false;
let mockGroups = [...MOCK_GROUPS];
let mockExpenses = [...MOCK_GROUP_EXPENSES];

// Normalize backend Group → frontend Group type
function mapGroup(raw: any): Group {
  const members = (raw.members ?? []).map((m: any) => ({
    userId: m.userId ?? m.user?.id ?? m.id,
    name: m.user?.name ?? m.name ?? 'Miembro',
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
    lastActivity: raw.lastActivity ?? raw.createdAt ?? raw.created_at,
  };
}

export async function getGroups(): Promise<Group[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return [...mockGroups];
  }

  const { data } = await apiClient.get<any[]>('/groups');
  return (data ?? []).map(mapGroup);
}

export async function getGroup(id: string): Promise<Group> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const group = mockGroups.find((g) => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  }

  const { data } = await apiClient.get<any>(`/groups/${id}`);
  return mapGroup(data);
}

export async function createGroup(dto: CreateGroupDTO): Promise<Group> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const newGroup: Group = {
      id: `group_${Date.now()}`,
      ...dto,
      members: dto.memberIds.map((id, i) => ({
        userId: id,
        name: `Miembro ${i + 1}`,
        balance: 0,
      })),
      createdBy: 'user_001',
      createdAt: new Date().toISOString(),
      totalExpenses: 0,
      lastActivity: new Date().toISOString(),
    };
    mockGroups = [newGroup, ...mockGroups];
    return newGroup;
  }

  const { data } = await apiClient.post<any>('/groups', {
    name: dto.name,
    memberIds: dto.memberIds,
  });
  return mapGroup(data);
}

export async function getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return mockExpenses.filter((e) => e.groupId === groupId);
  }

  const { data } = await apiClient.get<any[]>(`/groups/${groupId}/expenses`);
  return (data ?? []).map((e: any) => ({
    id: e.id,
    groupId: e.groupId,
    title: e.description,
    amount: Number(e.amount),
    paidBy: e.paidBy,
    paidByName: e.user?.name ?? 'Miembro',
    splitBetween: JSON.parse(e.splitBetween ?? '[]'),
    splitType: 'equal',
    categoryId: 'other',
    date: e.date ?? e.createdAt ?? new Date().toISOString(),
    createdAt: e.date ?? e.createdAt ?? new Date().toISOString(),
  }));
}

export async function addGroupExpense(
  groupId: string,
  dto: GroupExpenseDTO
): Promise<GroupExpense> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const newExpense: GroupExpense = {
      id: `gexp_${Date.now()}`,
      groupId,
      title: dto.title,
      amount: dto.amount,
      paidBy: dto.paidBy || 'user_001',
      splitBetween: dto.splitBetween,
      splitType: dto.splitType || 'equal',
      customSplits: dto.customSplits,
      categoryId: dto.categoryId || 'other',
      note: dto.note,
      date: dto.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockExpenses = [newExpense, ...mockExpenses];
    return newExpense;
  }

  const payload = {
    amount: dto.amount,
    description: dto.title ?? dto.note,
    splitBetween: dto.splitBetween,
  };
  const { data } = await apiClient.post<any>(`/groups/${groupId}/expenses`, payload);
  return {
    id: data.id,
    groupId,
    title: data.description ?? dto.title,
    amount: Number(data.amount),
    paidBy: data.paidBy,
    splitBetween: JSON.parse(data.splitBetween ?? '[]'),
    splitType: 'equal',
    categoryId: 'other',
    date: data.date ?? new Date().toISOString(),
    createdAt: data.date ?? new Date().toISOString(),
  };
}

export function calculateDebts(group: Group): DebtSummary[] {
  const debts: DebtSummary[] = [];
  const creditors = group.members.filter((m) => m.balance > 0);
  const debtors = group.members.filter((m) => m.balance < 0);

  for (const debtor of debtors) {
    let remaining = Math.abs(debtor.balance);
    for (const creditor of creditors) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, creditor.balance);
      if (amount > 0) {
        debts.push({
          from: debtor.userId,
          fromName: debtor.name,
          to: creditor.userId,
          toName: creditor.name,
          amount: Math.round(amount * 100) / 100,
        });
        remaining -= amount;
      }
    }
  }

  return debts;
}

export async function addGroupMember(groupId: string, memberName: string): Promise<Group> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');
    const newMember = {
      userId: `user_${Date.now()}`,
      name: memberName,
      balance: 0,
    };
    group.members = [...group.members, newMember];
    group.lastActivity = new Date().toISOString();
    return { ...group };
  }
  const { data } = await apiClient.post<Group>(`/groups/${groupId}/members`, { name: memberName });
  return data;
}

export async function removeGroupMember(groupId: string, userId: string): Promise<Group> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const group = mockGroups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');
    group.members = group.members.filter((m) => m.userId !== userId);
    group.lastActivity = new Date().toISOString();
    return { ...group };
  }
  const { data } = await apiClient.delete<Group>(`/groups/${groupId}/members/${userId}`);
  return data;
}
