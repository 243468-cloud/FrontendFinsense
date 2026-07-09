import api from './api';

export interface UserSearchResult {
  id: string;
  name: string;
  avatar: string | null;
  city: string;
  userXp: {
    level: number;
    badges: string[];
  } | null;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  avatar: string | null;
  city: string;
  userXp: {
    level: number;
    totalXp: number;
    badges: string[];
  } | null;
  streak: {
    currentStreak: number;
    longestStreak: number;
  } | null;
}

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
  if (!query) return [];
  const res = await api.get(`/auth/users/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const getPublicProfile = async (userId: string): Promise<PublicUserProfile> => {
  const res = await api.get(`/gamification/users/${userId}/profile`);
  return res.data;
};
