// FinSense — Utility Functions
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Target, Flame, Star, Trophy, Wallet, BarChart3, Users, 
  Utensils, Bus, BookOpen, Gamepad2, Zap, Activity, Shirt, 
  Landmark, Package, Home, Pizza, Car, Laptop, Film, 
  GraduationCap, Ticket, ShoppingBag, HelpCircle 
} from 'lucide-react';


// ─── Tailwind class merging ───
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting (MXN) ───
export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; showSign?: boolean }
): string {
  const abs = Math.abs(amount);
  const sign = options?.showSign ? (amount >= 0 ? '+' : '-') : amount < 0 ? '-' : '';

  if (options?.compact) {
    if (abs >= 1000) {
      return `${sign}$${(abs / 1000).toFixed(1)}k`;
    }
  }

  return `${sign}$${abs.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Date formatting ───
export function formatDate(dateString: string, pattern = 'd MMM yyyy'): string {
  try {
    return format(parseISO(dateString), pattern, { locale: es });
  } catch {
    return dateString;
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: es });
  } catch {
    return dateString;
  }
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Greeting based on time ───
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ─── Percentage calculation ───
export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}

// ─── Password strength ───
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  const levels = [
    { label: 'Muy débil', color: '#FF3B5C' },
    { label: 'Débil', color: '#FF6B6B' },
    { label: 'Regular', color: '#FFB800' },
    { label: 'Buena', color: '#00C896' },
    { label: 'Fuerte', color: '#0057FF' },
  ];

  return { score, ...levels[Math.min(score, 4)] };
}

// ─── Ripple effect ───
export function createRipple(
  event: React.MouseEvent<HTMLElement>,
  color = 'rgba(255,255,255,0.3)'
): void {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  const rect = button.getBoundingClientRect();

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.style.background = color;
  circle.classList.add('ripple');

  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) existingRipple.remove();

  button.appendChild(circle);
  setTimeout(() => circle.remove(), 700);
}

// ─── Countdown timer ───
export function getCountdown(deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = Math.max(target - now, 0);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// ─── Calculate splits ───
export function calculateEqualSplit(
  amount: number,
  memberCount: number
): number {
  return Math.round((amount / memberCount) * 100) / 100;
}

// ─── Avatar initials ───
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── XP Level calculation ───
export function getLevelProgress(xp: number): {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  percentage: number;
} {
  const xpPerLevel = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
  let level = 1;
  for (let i = 1; i < xpPerLevel.length; i++) {
    if (xp >= xpPerLevel[i]) level = i + 1;
    else break;
  }
  const xpStart = xpPerLevel[Math.min(level - 1, xpPerLevel.length - 1)];
  const xpEnd = xpPerLevel[Math.min(level, xpPerLevel.length - 1)];
  const xpInLevel = xp - xpStart;
  const xpForNextLevel = xpEnd - xpStart;
  return {
    level,
    xpInLevel,
    xpForNextLevel,
    percentage: getPercentage(xpInLevel, xpForNextLevel),
  };
}

// ─── Emoji to Lucide Icon Mapper ───
const EMOJI_ICON_MAP: Record<string, React.ComponentType<any>> = {
  '🎯': Target,
  '🔥': Flame,
  '⭐': Star,
  '🏆': Trophy,
  '💰': Wallet,
  '📊': BarChart3,
  '🤝': Users,
  '🍽️': Utensils,
  '🚌': Bus,
  '📚': BookOpen,
  '🎮': Gamepad2,
  '⚡': Zap,
  '💊': Activity,
  '👕': Shirt,
  '🏦': Landmark,
  '📦': Package,
  '🏛️': Landmark,
  '🏠': Home,
  '🍕': Pizza,
  '🚗': Car,
  '💻': Laptop,
  '🍿': Film,
  '🎓': GraduationCap,
  '🎟️': Ticket,
  '🎒': ShoppingBag,
};

export function getIconForEmoji(emoji: string): React.ComponentType<any> {
  return EMOJI_ICON_MAP[emoji] || HelpCircle;
}

