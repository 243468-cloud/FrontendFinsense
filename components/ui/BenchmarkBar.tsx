'use client';
// BenchmarkBar — barra comparativa entre usuario y promedio local
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';

interface BenchmarkBarProps {
  userValue: number;
  avgValue: number;
  label: string;
  emoji?: string;
  className?: string;
}

export function BenchmarkBar({
  userValue,
  avgValue,
  label,
  emoji,
  className,
}: BenchmarkBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const maxValue = Math.max(userValue, avgValue) * 1.2;
  const userWidth = (userValue / maxValue) * 100;
  const avgWidth = (avgValue / maxValue) * 100;
  const diff = userValue - avgValue;
  const percentDiff = avgValue > 0 ? Math.round((diff / avgValue) * 100) : 0;
  const isOver = diff > 0;

  return (
    <div ref={ref} className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-base" role="img" aria-hidden="true">{emoji}</span>}
          <span className="font-dm font-medium text-text-primary text-sm">{label}</span>
        </div>
        <span
          className={cn(
            'text-xs font-mono font-bold px-2 py-0.5 rounded-full',
            isOver
              ? 'text-red-500 bg-red-50'
              : 'text-success bg-green-50'
          )}
        >
          {isOver ? '+' : ''}{percentDiff}%
        </span>
      </div>

      {/* User bar */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary w-16 font-dm">Tú</span>
          <div className="flex-1 h-2.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isOver ? '#FF3B5C' : '#0057FF' }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${userWidth}%` } : { width: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.1 }}
            />
          </div>
          <span className="text-xs font-mono font-semibold text-text-primary w-16 text-right">
            {formatCurrency(userValue)}
          </span>
        </div>

        {/* Average bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary w-16 font-dm">Tuxtla</span>
          <div className="flex-1 h-2.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-text-secondary/40"
              initial={{ width: 0 }}
              animate={isInView ? { width: `${avgWidth}%` } : { width: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
            />
          </div>
          <span className="text-xs font-mono text-text-secondary w-16 text-right">
            {formatCurrency(avgValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
