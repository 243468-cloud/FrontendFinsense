'use client';
// Input — campo flotante con label animado (float label pattern)
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = Boolean(props.value || props.defaultValue);
    const isFloated = isFocused || hasValue;
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={cn('relative', className)}>
        {/* Icon left */}
        {icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            'peer w-full rounded-xl border bg-surface px-4 pb-2 pt-6 font-dm text-sm text-text-primary',
            'transition-all duration-200 outline-none',
            'placeholder-transparent',
            icon && 'pl-11',
            (rightIcon || type === 'password') && 'pr-11',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/10',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          placeholder={label}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-4 font-dm pointer-events-none transition-all duration-200 z-10',
            icon && 'left-11',
            isFloated
              ? 'top-2 text-xs text-primary'
              : 'top-1/2 -translate-y-1/2 text-sm text-text-secondary',
            error && isFloated && 'text-red-500'
          )}
        >
          {label}
        </label>

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors touch-target"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Right icon */}
        {rightIcon && type !== 'password' && (
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            aria-hidden="true"
          >
            {rightIcon}
          </div>
        )}

        {/* Error */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-500 font-dm"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-secondary font-dm">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
