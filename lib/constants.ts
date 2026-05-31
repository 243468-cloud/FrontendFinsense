// FinSense — App Constants

export const APP_NAME = 'FinSense';
export const APP_VERSION = '1.0.0';
export const APP_CITY = 'Tuxtla Gutiérrez';
export const APP_CITY_SHORT = 'Tuxtla';

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
export const API_TIMEOUT = 10000; // 10 seconds

// Auth
export const TOKEN_KEY = 'finsense_token';
export const REFRESH_TOKEN_KEY = 'finsense_refresh';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// PWA
export const PWA_THEME_COLOR = '#0057FF';

// Transaction categories
export const CATEGORIES = [
  { id: 'food',          label: 'Comida',         emoji: '🍽️', color: '#FF6B6B', bgColor: '#FFF0F0' },
  { id: 'transport',     label: 'Transporte',      emoji: '🚌', color: '#4ECDC4', bgColor: '#F0FAFA' },
  { id: 'university',   label: 'Universidad',     emoji: '📚', color: '#45B7D1', bgColor: '#F0F8FF' },
  { id: 'entertainment', label: 'Entretenimiento', emoji: '🎮', color: '#A855F7', bgColor: '#FAF0FF' },
  { id: 'services',     label: 'Servicios',       emoji: '⚡', color: '#FFB800', bgColor: '#FFFBF0' },
  { id: 'health',       label: 'Salud',           emoji: '💊', color: '#00C896', bgColor: '#F0FFF9' },
  { id: 'clothing',     label: 'Ropa',            emoji: '👕', color: '#FF8C00', bgColor: '#FFF5F0' },
  { id: 'savings',      label: 'Ahorro',          emoji: '🏦', color: '#0057FF', bgColor: '#F0F5FF' },
  { id: 'other',        label: 'Otro',            emoji: '📦', color: '#6B7280', bgColor: '#F5F5F5' },
] as const;

// Navigation items
export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Inicio',         icon: 'Home',    href: '/dashboard' },
  { id: 'transactions', label: 'Gastos',         icon: 'Receipt', href: '/transactions/new' },
  { id: 'fab',          label: 'Agregar',        icon: 'Plus',    href: '/transactions/new' },
  { id: 'goals',        label: 'Metas',          icon: 'Target',  href: '/goals' },
  { id: 'groups',       label: 'Grupos',         icon: 'Users',   href: '/groups' },
] as const;

// Salary benchmark for Tuxtla
export const TUXTLA_MONTHLY_INCOME_AVG = 4200; // MXN promedio Tuxtla
export const STUDENT_MONTHLY_INCOME = 3500;    // MXN estudiante universitario

// Animation durations
export const ANIM_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
} as const;
