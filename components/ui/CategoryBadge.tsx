'use client';
// CategoryBadge — chip con ícono y color por categoría
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import type { CategoryId } from '@/types/transaction.types';

interface CategoryBadgeProps {
  category: CategoryId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const sizeClasses = {
  sm: { container: 'w-8 h-8 text-base', badge: 'px-2 py-1 text-xs' },
  md: { container: 'w-11 h-11 text-xl',  badge: 'px-3 py-1.5 text-sm' },
  lg: { container: 'w-14 h-14 text-2xl', badge: 'px-4 py-2 text-base' },
};

export function CategoryBadge({
  category,
  size = 'md',
  showLabel = false,
  className,
  onClick,
  selected = false,
}: CategoryBadgeProps) {
  const cat = CATEGORIES.find((c) => c.id === category) ?? {
    id: category,
    label: category,
    emoji: '📦',
    color: '#6B7280',
    bgColor: '#F5F5F5',
  };

  if (showLabel) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-full font-dm font-medium transition-all duration-200',
          sizeClasses[size].badge,
          selected
            ? 'ring-2 ring-primary shadow-blue-sm scale-105'
            : 'hover:scale-105',
          className
        )}
        style={{
          backgroundColor: selected ? cat.color + '20' : cat.bgColor,
          color: cat.color,
          border: `1.5px solid ${cat.color}30`,
        }}
        aria-label={`Categoría: ${cat.label}`}
        aria-pressed={selected}
        type="button"
      >
        <span role="img" aria-hidden="true">{cat.emoji}</span>
        <span>{cat.label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl transition-all duration-200',
        sizeClasses[size].container,
        selected ? 'ring-2 ring-primary shadow-blue-sm scale-110' : 'hover:scale-110',
        className
      )}
      style={{ backgroundColor: cat.bgColor }}
      aria-label={`Categoría: ${cat.label}`}
      aria-pressed={selected}
      type="button"
    >
      <span role="img" aria-label={cat.label}>{cat.emoji}</span>
    </button>
  );
}
