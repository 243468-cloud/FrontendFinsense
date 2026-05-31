'use client';
// StreakCounter — contador de racha con ícono de fuego animado
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { emoji: 'text-lg', number: 'text-xl', label: 'text-xs' },
  md: { emoji: 'text-2xl', number: 'text-3xl', label: 'text-sm' },
  lg: { emoji: 'text-4xl', number: 'text-5xl', label: 'text-base' },
};

export function StreakCounter({ days, size = 'md', className }: StreakCounterProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      aria-label={`Racha de ${days} días`}
    >
      <motion.span
        className={cn('select-none', sizes.emoji)}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [-5, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
        role="img"
        aria-label="Fuego"
      >
        🔥
      </motion.span>

      <div className="flex flex-col leading-tight">
        <span
          className={cn('font-syne font-bold text-text-primary tabular-nums', sizes.number)}
        >
          {days}
        </span>
        <span className={cn('font-dm text-text-secondary', sizes.label)}>
          {days === 1 ? 'día' : 'días'}
        </span>
      </div>
    </div>
  );
}
