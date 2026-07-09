// Auth Types
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  city?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city: string;
  occupation?: string;
  monthlyIncome?: number;
  birthDate?: string;
  level: number;
  xp: number;
  coins: number;
  xpToNextLevel: number;
  streakDays: number;
  maxStreak: number;
  monthsActive: number;
  goalsCompleted: number;
  createdAt: string;
  badges?: string;
}
