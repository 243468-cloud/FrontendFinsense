'use client';
// Toast — notificación deslizable con auto-dismiss y barra de progreso
import { useEffect, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const iconMap = {
 success: CheckCircle2,
 error: XCircle,
 warning: AlertTriangle,
 info: Info,
};

const colorMap = {
 success: {
 bg: 'bg-surface border-l-4 border-success',
 icon: 'text-success',
 progress: 'bg-success',
 },
 error: {
 bg: 'bg-surface border-l-4 border-red-500',
 icon: 'text-red-500',
 progress: 'bg-red-500',
 },
 warning: {
 bg: 'bg-surface border-l-4 border-warning',
 icon: 'text-warning',
 progress: 'bg-warning',
 },
 info: {
 bg: 'bg-surface border-l-4 border-primary',
 icon: 'text-primary',
 progress: 'bg-primary',
 },
};

interface ToastItemProps {
 id: string;
 message: string;
 type: 'success' | 'error' | 'warning' | 'info';
 duration?: number;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(
 ({ id, message, type, duration = 4000 }, ref) => {
 const removeToast = useUIStore((s) => s.removeToast);
 const [progress, setProgress] = useState(100);
 const colors = colorMap[type];
 const Icon = iconMap[type];

 useEffect(() => {
 const startTime = Date.now();
 const interval = setInterval(() => {
 const elapsed = Date.now() - startTime;
 const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
 setProgress(remaining);
 if (remaining === 0) {
 clearInterval(interval);
 removeToast(id);
 }
 }, 50);
 return () => clearInterval(interval);
 }, [id, duration, removeToast]);

 return (
 <motion.div
 ref={ref}
 key={id}
 layout
 initial={{ y: -80, opacity: 0, scale: 0.9 }}
 animate={{ y: 0, opacity: 1, scale: 1 }}
 exit={{ y: -80, opacity: 0, scale: 0.9 }}
 transition={{ type: 'spring', stiffness: 300, damping: 25 }}
 className={cn(
 'relative w-80 rounded-2xl overflow-hidden',
 colors.bg,
 'shadow-blue-sm'
 )}
 role="alert"
 aria-live="polite"
 >
 <div className="flex items-start gap-3 p-4">
 <Icon size={20} className={cn('flex-shrink-0 mt-0.5', colors.icon)} />
 <p className="font-dm text-sm text-text-primary flex-1 leading-snug">
 {message}
 </p>
 <button
 onClick={() => removeToast(id)}
 className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors touch-target"
 aria-label="Cerrar notificación"
 >
 <X size={16} />
 </button>
 </div>

 {/* Progress bar */}
 <div className="h-0.5 bg-surface-3 w-full">
 <div
 className={cn('h-full transition-none rounded-full', colors.progress)}
 style={{ width: `${progress}%` }}
 />
 </div>
 </motion.div>
 );
 }
);

ToastItem.displayName = 'ToastItem';

export function ToastContainer() {
 const toasts = useUIStore((s) => s.toasts);

 return (
 <div
 className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center"
 aria-label="Notificaciones"
 >
 <AnimatePresence mode="popLayout">
 {toasts.map((toast) => (
 <ToastItem key={toast.id} {...toast} />
 ))}
 </AnimatePresence>
 </div>
 );
}
