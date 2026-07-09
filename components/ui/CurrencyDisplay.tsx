'use client';
// CurrencyDisplay — cifras financieras con animación de conteo
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface CurrencyDisplayProps {
 amount: number;
 animated?: boolean;
 size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
 className?: string;
 showSign?: boolean;
 color?: 'default' | 'success' | 'error' | 'white';
 prefix?: string;
}

const sizeClasses = {
 sm: 'text-base',
 md: 'text-xl',
 lg: 'text-2xl',
 xl: 'text-4xl',
 '2xl': 'text-5xl',
};

const colorClasses = {
 default: 'text-text-primary',
 success: 'text-success',
 error: 'text-red-500',
 white: 'text-white',
};

export function CurrencyDisplay({
 amount,
 animated = false,
 size = 'md',
 className,
 showSign = false,
 color = 'default',
 prefix = '$',
}: CurrencyDisplayProps) {
 const ref = useRef<HTMLSpanElement>(null);
 const isInView = useInView(ref, { once: true });
 const [displayValue, setDisplayValue] = useState(animated ? 0 : amount);
 const { preferences } = useAuthStore();
 const hideBalances = preferences?.privacy?.hideBalances ?? false;

 useEffect(() => {
 if (!animated || !isInView) return;

 const duration = 1200;
 const startTime = performance.now();
 const startValue = 0;
 const endValue = amount;

 function easeOutQuad(t: number): number {
 return t * (2 - t);
 }

 function animate(currentTime: number) {
 const elapsed = currentTime - startTime;
 const progress = Math.min(elapsed / duration, 1);
 const easedProgress = easeOutQuad(progress);
 setDisplayValue(Math.round(startValue + easedProgress * (endValue - startValue)));

 if (progress < 1) {
 requestAnimationFrame(animate);
 } else {
 setDisplayValue(endValue);
 }
 }

 requestAnimationFrame(animate);
 }, [animated, isInView, amount]);

 const sign = showSign ? (amount >= 0 ? '+' : '') : '';
 const formattedValue = Math.abs(displayValue).toLocaleString('es-MX', {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 });

 if (hideBalances) {
  return (
    <span
      ref={ref}
      className={cn(
        'font-mono font-bold tracking-widest',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-label="Saldo oculto"
    >
      ****
    </span>
  );
 }

 return (
 <span
 ref={ref}
 className={cn(
 'font-mono font-semibold tabular-nums',
 sizeClasses[size],
 colorClasses[color],
 className
 )}
 aria-label={`${prefix}${amount.toFixed(2)}`}
 >
 {sign}
 {prefix}
 {formattedValue}
 </span>
 );
}
