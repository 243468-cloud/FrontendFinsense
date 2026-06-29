'use client';
// AchievementBadge — insignia con bounce + glow al desbloquear
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn, getIconForEmoji } from '@/lib/utils';
import type { Achievement } from '@/types/goal.types';


interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onUnlock?: () => void;
}

const sizeMap = {
  sm: { container: 'w-14 h-14', iconSize: 22, lock: 12 },
  md: { container: 'w-20 h-20', iconSize: 32, lock: 16 },
  lg: { container: 'w-24 h-24', iconSize: 40, lock: 20 },
};


export function AchievementBadge({
  achievement,
  unlocked,
  size = 'md',
  className,
}: AchievementBadgeProps) {
  const sizes = sizeMap[size];

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-1.5', className)}
      initial={unlocked ? { scale: 0.8, opacity: 0 } : {}}
      animate={unlocked ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.div
        className={cn(
          'relative rounded-2xl flex items-center justify-center transition-all duration-300',
          sizes.container,
          unlocked
            ? 'bg-gradient-to-br from-surface-2 to-surface-3 border border-primary/20'
            : 'bg-surface-3 border border-border opacity-50 grayscale'
        )}
        whileHover={unlocked ? { scale: 1.08, y: -2 } : {}}
        style={
          unlocked
            ? {
                boxShadow: '0 4px 20px rgba(0, 87, 255, 0.15)',
              }
            : {}
        }
        animate={
          unlocked
            ? {
                boxShadow: [
                  '0 4px 20px rgba(0, 87, 255, 0.15)',
                  '0 4px 30px rgba(0, 87, 255, 0.35)',
                  '0 4px 20px rgba(0, 87, 255, 0.15)',
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        role="img"
        aria-label={unlocked ? achievement.title : `${achievement.title} (bloqueado)`}
      >
        {(() => {
          const Icon = getIconForEmoji(achievement.emoji);
          return <Icon size={sizes.iconSize} className={unlocked ? 'text-primary' : 'text-text-secondary'} aria-hidden="true" />;
        })()}


        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-3/60 rounded-2xl">
            <Lock size={sizes.lock} className="text-text-secondary" />
          </div>
        )}

        {unlocked && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <span className="text-white text-xs font-bold">✓</span>
          </motion.div>
        )}
      </motion.div>

      <div className="text-center">
        <p
          className={cn(
            'text-xs font-dm font-semibold leading-tight',
            unlocked ? 'text-text-primary' : 'text-text-secondary'
          )}
        >
          {achievement.title}
        </p>
        {unlocked && (
          <p className="text-xs text-primary font-mono">+{achievement.xpReward} XP</p>
        )}
      </div>
    </motion.div>
  );
}
