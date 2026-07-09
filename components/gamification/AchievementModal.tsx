import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Achievement } from '@/services/gamificationService';
import { getIconForEmoji } from '@/lib/utils';

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  if (!achievement) return null;
  const Icon = getIconForEmoji(achievement.emoji);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Confetti Container (could add canvas-confetti here later) */}
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative w-full max-w-sm bg-surface border-2 border-[#FDCB6E]/30 rounded-3xl shadow-2xl shadow-[#FDCB6E]/20 overflow-hidden z-10 flex flex-col items-center text-center p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-black/5 text-text-secondary transition-colors"
          >
            <X size={20} />
          </button>

          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-6xl shadow-inner mb-6 relative"
            style={{ backgroundColor: `${achievement.color}20`, border: `4px solid ${achievement.color}` }}
          >
            <Icon size={48} style={{ color: achievement.color }} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] rounded-full border-2 border-dashed border-[#FDCB6E]/50"
            />
          </motion.div>

          <h3 className="font-syne font-bold text-2xl text-text-primary mb-2">
            ¡Insignia Desbloqueada!
          </h3>
          
          <h4 className="font-dm font-bold text-lg mb-2" style={{ color: achievement.color }}>
            {achievement.title}
          </h4>
          
          <p className="font-dm text-sm text-text-secondary mb-6">
            {achievement.description}
          </p>

          <div className="flex items-center gap-2 bg-[#FDCB6E]/10 text-[#d49e38] px-4 py-2 rounded-xl font-bold font-dm">
            <Star size={18} className="fill-current" />
            <span>+{achievement.xpReward} XP Ganados</span>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-dm font-semibold transition-all shadow-blue-sm"
          >
            ¡Genial!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
