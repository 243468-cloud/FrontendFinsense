'use client';
// TransactionItem — ítem de lista con swipe para revelar acciones
import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trash2, Edit2 } from 'lucide-react';
import { cn, formatCurrency, formatRelativeDate, getIconForEmoji } from '@/lib/utils';

import { CATEGORIES } from '@/lib/constants';
import type { Transaction } from '@/types/transaction.types';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export function TransactionItem({
  transaction,
  onDelete,
  onEdit,
  className,
}: TransactionItemProps) {
  const cat = CATEGORIES.find((c) => c.id === transaction.categoryId);
  const isExpense = transaction.type === 'expense';
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, -60, 0, 60, 100],
    ['#FF3B5C', '#FF3B5C', 'transparent', '#0057FF', '#0057FF']
  );
  const [revealed, setRevealed] = useState<'delete' | 'edit' | null>(null);

  function handleDragEnd() {
    const currentX = x.get();
    if (currentX < -60) {
      setRevealed('delete');
      animate(x, -90, { type: 'spring', stiffness: 300, damping: 30 });
    } else if (currentX > 60) {
      setRevealed('edit');
      animate(x, 90, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      setRevealed(null);
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  }

  function resetSwipe() {
    setRevealed(null);
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl', className)}
      role="listitem"
    >
      {/* Background actions */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6 rounded-2xl"
        style={{ background }}
      >
        <button
          onClick={() => { onEdit?.(transaction.id); resetSwipe(); }}
          className="flex items-center gap-1 text-white font-dm font-semibold text-sm"
          aria-label="Editar transacción"
        >
          <Edit2 size={16} />
          <span>Editar</span>
        </button>
        <button
          onClick={() => { onDelete?.(transaction.id); resetSwipe(); }}
          className="flex items-center gap-1 text-white font-dm font-semibold text-sm"
          aria-label="Eliminar transacción"
        >
          <span>Eliminar</span>
          <Trash2 size={16} />
        </button>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -90, right: 90 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={revealed ? resetSwipe : undefined}
        whileTap={{ scale: 0.995 }}
      >
        {/* Category icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cat?.bgColor ?? '#F5F5F5' }}
          aria-hidden="true"
        >
          {(() => {
            const Icon = getIconForEmoji(cat?.emoji ?? '📦');
            return <Icon size={20} style={{ color: cat?.color ?? '#6B7280' }} />;
          })()}
        </div>


        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="font-dm font-semibold text-text-primary text-sm truncate">
            {transaction.note || cat?.label || 'Transacción'}
          </p>
          <p className="font-dm text-text-secondary text-xs">
            {formatRelativeDate(transaction.createdAt)}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p
            className={cn(
              'font-mono font-bold text-sm',
              isExpense ? 'text-red-500' : 'text-success'
            )}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-text-secondary font-dm">{cat?.label}</p>
        </div>
      </motion.div>
    </div>
  );
}
