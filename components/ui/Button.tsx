'use client';
// Button — variantes primary/secondary/ghost/danger con ripple effect
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn, createRipple } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses = {
  primary:
    'bg-gradient-to-r from-primary to-primary-light text-white shadow-blue-sm hover:shadow-blue-lg hover:from-primary-dark hover:to-primary',
  secondary:
    'bg-surface-2 text-primary border border-primary/20 hover:bg-surface-3 hover:border-primary/40',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  outline:
    'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white',
};

const sizeClasses = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (!disabled && !loading) {
        createRipple(e);
        onClick?.(e);
      }
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'ripple-container relative inline-flex items-center justify-center font-dm font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
        whileHover={!disabled && !loading ? { y: -1 } : {}}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          iconPosition === 'left' && icon && (
            <span aria-hidden="true">{icon}</span>
          )
        )}
        {children}
        {!loading && iconPosition === 'right' && icon && (
          <span aria-hidden="true">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
