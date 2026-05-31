'use client';
// ProgressBar — barra de progreso animada con spring physics
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn, getPercentage } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  animated?: boolean;
  color?: string;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  trackColor?: string;
}

const heightClasses = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max,
  animated = true,
  color = '#0057FF',
  height = 'sm',
  showLabel = false,
  label,
  className,
  trackColor = '#E8EEFF',
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = getPercentage(value, max);

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-dm text-text-secondary">{label}</span>
          )}
          {showLabel && (
            <span
              className="text-xs font-mono font-semibold"
              style={{ color }}
            >
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn('w-full rounded-full overflow-hidden', heightClasses[height])}
        style={{ backgroundColor: trackColor }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? `${percentage}% completado`}
      >
        <motion.div
          className="h-full rounded-full origin-left"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: animated ? percentage / 100 : percentage / 100 } : { scaleX: 0 }}
          transition={
            animated
              ? { type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
}
