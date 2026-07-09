'use client';
// SkeletonCard — placeholder de carga con shimmer azul
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
 className?: string;
 lines?: number;
 showAvatar?: boolean;
 showImage?: boolean;
 height?: string;
}

function SkeletonLine({ className }: { className?: string }) {
 return (
 <div className={cn('shimmer-bg rounded-lg', className)} aria-hidden="true" />
 );
}

export function SkeletonCard({
 className,
 lines = 3,
 showAvatar = false,
 height,
}: SkeletonCardProps) {
 return (
 <div
 className={cn(
 'bg-surface border border-border rounded-2xl p-4 space-y-3',
 className
 )}
 role="status"
 aria-label="Cargando..."
 style={height ? { height } : {}}
 >
 {showAvatar && (
 <div className="flex items-center gap-3">
 <div className="shimmer-bg w-11 h-11 rounded-full flex-shrink-0" aria-hidden="true" />
 <div className="flex-1 space-y-2">
 <SkeletonLine className="h-3 w-3/4" />
 <SkeletonLine className="h-2.5 w-1/2" />
 </div>
 </div>
 )}

 {Array.from({ length: lines }, (_, i) => (
 <SkeletonLine
 key={i}
 className={cn(
 'h-3',
 i === 0 && 'w-full',
 i === 1 && 'w-4/5',
 i === 2 && 'w-3/5',
 i > 2 && 'w-2/3'
 )}
 />
 ))}
 </div>
 );
}

// Skeleton for a transaction list item
export function SkeletonTransactionItem({ className }: { className?: string }) {
 return (
 <div
 className={cn(
 'bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-3',
 className
 )}
 role="status"
 aria-label="Cargando transacción..."
 >
 <div className="shimmer-bg w-11 h-11 rounded-2xl flex-shrink-0" />
 <div className="flex-1 space-y-2">
 <SkeletonLine className="h-3 w-3/4" />
 <SkeletonLine className="h-2 w-1/3" />
 </div>
 <div className="space-y-1 text-right">
 <SkeletonLine className="h-3 w-16" />
 <SkeletonLine className="h-2 w-10" />
 </div>
 </div>
 );
}
