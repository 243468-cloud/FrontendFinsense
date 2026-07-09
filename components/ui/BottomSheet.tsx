'use client';
// BottomSheet — modal deslizable desde abajo nativo mobile
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
 open: boolean;
 onClose: () => void;
 children: React.ReactNode;
 title?: string;
 className?: string;
 snapPoints?: number[];
 showHandle?: boolean;
}

export function BottomSheet({
 open,
 onClose,
 children,
 title,
 className,
 showHandle = true,
}: BottomSheetProps) {
 const dragControls = useDragControls();
 const sheetRef = useRef<HTMLDivElement>(null);

 // Lock body scroll when open
 useEffect(() => {
 if (open) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }
 return () => {
 document.body.style.overflow = '';
 };
 }, [open]);

 // Close on Escape key
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 };
 document.addEventListener('keydown', handleKeyDown);
 return () => document.removeEventListener('keydown', handleKeyDown);
 }, [onClose]);

 return (
 <AnimatePresence>
 {open && (
 <>
 {/* Backdrop */}
 <motion.div
 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 aria-hidden="true"
 />

 {/* Sheet */}
 <motion.div
 ref={sheetRef}
 className={cn(
 'fixed bottom-0 left-0 right-0 z-[101] bg-surface rounded-t-3xl',
 'pb-safe-bottom overflow-hidden',
 className
 )}
 style={{
 boxShadow: '0 -8px 40px rgba(0, 87, 255, 0.15)',
 maxHeight: '92vh',
 }}
 initial={{ y: '100%' }}
 animate={{ y: 0 }}
 exit={{ y: '100%' }}
 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
 drag="y"
 dragControls={dragControls}
 dragConstraints={{ top: 0 }}
 dragElastic={{ top: 0, bottom: 0.5 }}
 onDragEnd={(_, info) => {
 if (info.offset.y > 100) onClose();
 }}
 role="dialog"
 aria-modal="true"
 aria-label={title ?? 'Panel de opciones'}
 >
 {/* Handle */}
 {showHandle && (
 <div
 className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
 onPointerDown={(e) => dragControls.start(e)}
 >
 <div className="w-10 h-1 bg-border rounded-full" />
 </div>
 )}

 {/* Header */}
 {title && (
 <div className="flex items-center justify-between px-6 py-4 border-b border-border">
 <h2 className="font-syne font-bold text-lg text-text-primary">
 {title}
 </h2>
 <button
 onClick={onClose}
 className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
 aria-label="Cerrar panel"
 >
 <X size={20} className="text-text-secondary" />
 </button>
 </div>
 )}

 {/* Content */}
 <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 80px)' }}>
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
