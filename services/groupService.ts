// FinSense — Group Service (SOA)
import apiClient from '@/lib/apiClient';
import type { Group, CreateGroupDTO, GroupExpense, GroupExpenseDTO, DebtSummary } from '@/types/group.types';
import { MOCK_GROUPS, MOCK_GROUP_EXPENSES } from '@/lib/mockData';

const USE_MOCK = true;
let mockGroups = [...MOCK_GROUPS];
let mockExpenses = [...MOCK_GROUP_EXPENSES];

export async function getGroups(): Promise<Group[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return [...mockGroups];
  }

  const { data } = await apiClient.get<Group[]>('/groups');
  return data;
}

export async function getGroup(id: string): Promise<Group> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const group = mockGroups.find((g) => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  }

  const { data } = await apiClient.get<Group>(`/groups/${id}`);
  return data;
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

  const { data } = await apiClient.post<Group>('/groups', dto);
  return data;
}

export async function getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return mockExpenses.filter((e) => e.groupId === groupId);
  }

  const { data } = await apiClient.get<GroupExpense[]>(`/groups/${groupId}/expenses`);
  return data;
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
      ...dto,
      createdAt: new Date().toISOString(),
    };
    mockExpenses = [newExpense, ...mockExpenses];
    return newExpense;
  }

  const { data } = await apiClient.post<GroupExpense>(`/groups/${groupId}/expenses`, dto);
  return data;
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
