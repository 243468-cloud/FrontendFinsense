// Group Types
export interface GroupMember {
  userId: string;
  name: string;
  avatar?: string;
  balance: number; // positive = owed money, negative = owes money
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  totalExpenses: number;
  lastActivity: string;
}

export interface CreateGroupDTO {
  name: string;
  emoji: string;
  description?: string;
  memberIds: string[];
}

export interface GroupExpense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  paidByName?: string;
  splitBetween: string[];
  splitType: 'equal' | 'custom';
  customSplits?: Record<string, number>;
  categoryId: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface GroupExpenseDTO {
  title: string;
  amount: number;
  paidBy?: string;
  splitBetween: string[];
  splitType?: 'equal' | 'custom';
  customSplits?: Record<string, number>;
  categoryId?: string;
  note?: string;
  date?: string;
}

export interface DebtSummary {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}
