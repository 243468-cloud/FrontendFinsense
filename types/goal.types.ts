// Goal Types
export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: GoalStatus;
  categoryId: string;
  emoji: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateGoalDTO {
  title: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  categoryId: string;
  emoji: string;
}

export type AchievementId =
  | 'first_transaction'
  | 'week_streak'
  | 'month_streak'
  | 'first_goal'
  | 'goal_complete'
  | 'saver_100'
  | 'saver_500'
  | 'saver_1000'
  | 'budget_master'
  | 'social_spender'
  | 'tuxtla_local'
  | 'zero_debt';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  xpReward: number;
  isCompleted: boolean;
}
