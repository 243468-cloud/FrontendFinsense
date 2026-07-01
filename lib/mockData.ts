// FinSense — Mock Data (Tuxtla Gutiérrez, Chiapas)
import type { User } from '@/types/auth.types';
import type { Transaction } from '@/types/transaction.types';
import type { Goal, Achievement, WeeklyChallenge } from '@/types/goal.types';
import type { Group, GroupExpense } from '@/types/group.types';
import type { Summary, BenchmarkReport } from '@/types/analytics.types';

// ─── Mock User ───
export const MOCK_USER: User = {
  id: 'user_001',
  name: 'Marco García',
  email: 'marco.garcia@unach.edu.mx',
  avatar: undefined,
  city: 'Tuxtla Gutiérrez',
  level: 4,
  xp: 780,
  xpToNextLevel: 1000,
  streakDays: 7,
  maxStreak: 14,
  monthsActive: 3,
  goalsCompleted: 2,
  createdAt: '2024-02-15T10:00:00Z',
  badges: '[]',
};

// ─── Mock Transactions ───
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    userId: 'user_001',
    type: 'expense',
    amount: 55,
    categoryId: 'food',
    note: 'Comida corrida en mercado Cristóbal Colón',
    date: '2024-05-30',
    createdAt: '2024-05-30T13:15:00Z',
  },
  {
    id: 'tx_002',
    userId: 'user_001',
    type: 'expense',
    amount: 16,
    categoryId: 'transport',
    note: 'Combi a la UNACH ida y vuelta',
    date: '2024-05-30',
    createdAt: '2024-05-30T08:00:00Z',
  },
  {
    id: 'tx_003',
    userId: 'user_001',
    type: 'income',
    amount: 3500,
    categoryId: 'other',
    note: 'Beca universitaria mensual',
    date: '2024-05-28',
    createdAt: '2024-05-28T09:00:00Z',
  },
  {
    id: 'tx_004',
    userId: 'user_001',
    type: 'expense',
    amount: 120,
    categoryId: 'university',
    note: 'Copias y papelería para proyecto',
    date: '2024-05-27',
    createdAt: '2024-05-27T11:30:00Z',
  },
  {
    id: 'tx_005',
    userId: 'user_001',
    type: 'expense',
    amount: 180,
    categoryId: 'entertainment',
    note: 'Cine plaza Crystal con amigos',
    date: '2024-05-25',
    createdAt: '2024-05-25T19:00:00Z',
  },
  {
    id: 'tx_006',
    userId: 'user_001',
    type: 'expense',
    amount: 45,
    categoryId: 'food',
    note: 'Tacos de canasta en la 1a Sur',
    date: '2024-05-24',
    createdAt: '2024-05-24T14:00:00Z',
  },
  {
    id: 'tx_007',
    userId: 'user_001',
    type: 'expense',
    amount: 350,
    categoryId: 'services',
    note: 'Telcel plan mensual',
    date: '2024-05-20',
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'tx_008',
    userId: 'user_001',
    type: 'expense',
    amount: 200,
    categoryId: 'savings',
    note: 'Ahorro para laptop',
    date: '2024-05-28',
    createdAt: '2024-05-28T10:00:00Z',
  },
];

// ─── Mock Goals ───
export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal_001',
    userId: 'user_001',
    title: 'Nueva Laptop para la Uni',
    description: 'Ahorrar para una laptop para mis materias de programación',
    targetAmount: 8000,
    currentAmount: 2400,
    deadline: '2024-08-31',
    status: 'active',
    categoryId: 'university',
    emoji: '💻',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'goal_002',
    userId: 'user_001',
    title: 'Viaje a Palenque',
    description: 'Conocer las ruinas con amigos en vacaciones',
    targetAmount: 2500,
    currentAmount: 1800,
    deadline: '2024-07-15',
    status: 'active',
    categoryId: 'entertainment',
    emoji: '🏛️',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'goal_003',
    userId: 'user_001',
    title: 'Fondo de Emergencia',
    description: '3 meses de gastos básicos ahorrados',
    targetAmount: 5000,
    currentAmount: 5000,
    deadline: '2024-04-30',
    status: 'completed',
    categoryId: 'savings',
    emoji: '🛡️',
    createdAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-04-28T15:30:00Z',
  },
];

// ─── Mock Achievements ───
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_transaction',
    title: 'Primer Paso',
    description: 'Registraste tu primera transacción',
    emoji: '🎯',
    xpReward: 50,
    unlockedAt: '2024-02-16T10:00:00Z',
  },
  {
    id: 'week_streak',
    title: 'Una Semana de Racha',
    description: '7 días consecutivos registrando',
    emoji: '🔥',
    xpReward: 100,
    unlockedAt: '2024-02-22T10:00:00Z',
  },
  {
    id: 'first_goal',
    title: 'Soñador',
    description: 'Creaste tu primera meta de ahorro',
    emoji: '⭐',
    xpReward: 75,
    unlockedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'goal_complete',
    title: 'Meta Cumplida',
    description: 'Completaste una meta de ahorro',
    emoji: '🏆',
    xpReward: 200,
    unlockedAt: '2024-04-28T15:30:00Z',
  },
  {
    id: 'saver_100',
    title: 'Ahorrador Novato',
    description: 'Ahorraste $100 en un mes',
    emoji: '💰',
    xpReward: 50,
    unlockedAt: '2024-03-31T23:59:00Z',
  },
  {
    id: 'budget_master',
    title: 'Maestro del Presupuesto',
    description: 'No superes tu presupuesto 3 meses seguidos',
    emoji: '📊',
    xpReward: 300,
    unlockedAt: undefined,
  },
  {
    id: 'social_spender',
    title: 'Gastos Sociales',
    description: 'Registra un gasto grupal con amigos',
    emoji: '🤝',
    xpReward: 75,
    unlockedAt: undefined,
  },
  {
    id: 'tuxtla_local',
    title: 'Tuxtla Local',
    description: 'Gasta menos que el promedio de Tuxtla 3 meses',
    emoji: '🌮',
    xpReward: 150,
    unlockedAt: undefined,
  },
];

// ─── Mock Weekly Challenge ───
export const MOCK_WEEKLY_CHALLENGE: WeeklyChallenge = {
  id: 'challenge_001',
  title: 'Semana de Combis',
  description: 'Gasta menos de $120 en transporte esta semana',
  emoji: '🚌',
  targetAmount: 120,
  currentAmount: 64,
  deadline: '2024-06-02T23:59:00Z',
  xpReward: 150,
  isCompleted: false,
};

// ─── Mock Groups ───
export const MOCK_GROUPS: Group[] = [
  {
    id: 'group_001',
    name: 'Viaje Palenque',
    emoji: '🏛️',
    description: 'Gastos del viaje a las ruinas',
    members: [
      { userId: 'user_001', name: 'Marco García',  avatar: undefined, balance: -150 },
      { userId: 'user_002', name: 'Sofía López',   avatar: undefined, balance: 75 },
      { userId: 'user_003', name: 'Diego Morales', avatar: undefined, balance: 75 },
    ],
    createdBy: 'user_001',
    createdAt: '2024-05-20T10:00:00Z',
    totalExpenses: 900,
    lastActivity: '2024-05-28T18:00:00Z',
  },
  {
    id: 'group_002',
    name: 'Casa de los Cuates',
    emoji: '🏠',
    description: 'Gastos compartidos del departamento',
    members: [
      { userId: 'user_001', name: 'Marco García',   avatar: undefined, balance: 200 },
      { userId: 'user_004', name: 'Carlos Ruiz',    avatar: undefined, balance: -100 },
      { userId: 'user_005', name: 'Andrés Jiménez', avatar: undefined, balance: -100 },
    ],
    createdBy: 'user_004',
    createdAt: '2024-03-01T10:00:00Z',
    totalExpenses: 3400,
    lastActivity: '2024-05-29T12:00:00Z',
  },
];

// ─── Mock Group Expenses ───
export const MOCK_GROUP_EXPENSES: GroupExpense[] = [
  {
    id: 'gexp_001',
    groupId: 'group_001',
    title: 'Gasolina para la camioneta',
    amount: 600,
    paidBy: 'user_001',
    splitBetween: ['user_001', 'user_002', 'user_003'],
    splitType: 'equal',
    categoryId: 'transport',
    note: 'Ida y vuelta Tuxtla-Palenque',
    date: '2024-05-25',
    createdAt: '2024-05-25T08:00:00Z',
  },
  {
    id: 'gexp_002',
    groupId: 'group_001',
    title: 'Entradas zona arqueológica',
    amount: 300,
    paidBy: 'user_002',
    splitBetween: ['user_001', 'user_002', 'user_003'],
    splitType: 'equal',
    categoryId: 'entertainment',
    date: '2024-05-25',
    createdAt: '2024-05-25T10:00:00Z',
  },
];

// ─── Mock Analytics Summary ───
export const MOCK_SUMMARY: Summary = {
  period: 'month',
  totalIncome: 3500,
  totalExpenses: 2150,
  balance: 1350,
  savingsRate: 38.57,
  topCategories: [
    { categoryId: 'food',          label: 'Comida',         emoji: '🍽️', color: '#FF6B6B', amount: 780,  percentage: 36.3, trend: 5.2  },
    { categoryId: 'transport',     label: 'Transporte',     emoji: '🚌', color: '#4ECDC4', amount: 480,  percentage: 22.3, trend: -3.1 },
    { categoryId: 'services',      label: 'Servicios',      emoji: '⚡', color: '#FFB800', amount: 350,  percentage: 16.3, trend: 0    },
    { categoryId: 'entertainment', label: 'Entretenimiento',emoji: '🎮', color: '#A855F7', amount: 320,  percentage: 14.9, trend: 12.0 },
    { categoryId: 'university',    label: 'Universidad',    emoji: '📚', color: '#45B7D1', amount: 220,  percentage: 10.2, trend: -8.5 },
  ],
  dailyData: Array.from({ length: 30 }, (_, i) => ({
    date: `2024-05-${String(i + 1).padStart(2, '0')}`,
    income: i === 27 ? 3500 : 0,
    expenses: Math.floor(Math.random() * 200) + 30,
  })),
  weeklyData: [
    { week: 'Sem 1', income: 0,    expenses: 520 },
    { week: 'Sem 2', income: 0,    expenses: 480 },
    { week: 'Sem 3', income: 3500, expenses: 650 },
    { week: 'Sem 4', income: 0,    expenses: 500 },
  ],
};

// ─── Mock Benchmarks (valores reales aproximados de Tuxtla Gutiérrez 2024) ───
export const MOCK_BENCHMARKS: BenchmarkReport = {
  city: 'Tuxtla Gutiérrez',
  period: 'month',
  benchmarks: [
    {
      categoryId: 'food',
      label: 'Comida',
      emoji: '🍽️',
      userAmount: 780,
      cityAverage: 650,
      city: 'Tuxtla Gutiérrez',
      percentageDiff: 20,
    },
    {
      categoryId: 'transport',
      label: 'Transporte',
      emoji: '🚌',
      userAmount: 480,
      cityAverage: 520,
      city: 'Tuxtla Gutiérrez',
      percentageDiff: -7.7,
    },
    {
      categoryId: 'services',
      label: 'Servicios',
      emoji: '⚡',
      userAmount: 350,
      cityAverage: 380,
      city: 'Tuxtla Gutiérrez',
      percentageDiff: -7.9,
    },
    {
      categoryId: 'entertainment',
      label: 'Entretenimiento',
      emoji: '🎮',
      userAmount: 320,
      cityAverage: 280,
      city: 'Tuxtla Gutiérrez',
      percentageDiff: 14.3,
    },
  ],
  overallSavingsComparison: 15.2,
  suggestion: 'Podrías ahorrar ~$800 al mes comiendo más en mercados locales y reduciendo entretenimiento.',
};
