import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpInfo: { old: number; new: number };
}

export function LevelUpModal({ isOpen, onClose, levelUpInfo }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          {/* Sparkles / Confetti Particle Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => {
              const randomX = Math.random() * 100;
              const randomDelay = Math.random() * 1.5;
              const randomDuration = 1.5 + Math.random() * 1.5;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: ['#0057FF', '#00C2FF', '#00C896', '#FFB800', '#EC4899'][i % 5],
                    left: `${randomX}%`,
                    bottom: '0%',
                  }}
                  animate={{
                    y: [0, -600],
                    x: [0, (Math.random() - 0.5) * 200],
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: randomDuration,
                    delay: randomDelay,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="bg-surface rounded-[2.5rem] border border-border shadow-blue-lg max-w-sm w-full p-8 text-center relative overflow-hidden"
          >
            {/* Glowing background circles */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-success/10 rounded-full blur-2xl pointer-events-none" />

            {/* Level Up Badge */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-blue-lg text-white border-4 border-white"
            >
              <Trophy size={36} className="text-white drop-shadow-sm" />
            </motion.div>

            <h2 className="font-syne font-black text-2xl sm:text-3xl text-text-primary tracking-tight mb-2">
              ¡SUBISTE DE NIVEL! 🚀
            </h2>
            <p className="font-dm text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
              Tu consistencia en el ahorro y registro de gastos está dando frutos. ¡Sigue así!
            </p>

            {/* Level comparison pills */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-surface-2 px-4 py-2 rounded-2xl border border-border">
                <span className="text-[9px] font-dm font-bold text-text-secondary block">Nivel Anterior</span>
                <span className="font-mono text-base font-bold text-text-primary">{levelUpInfo.old}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                ➔
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                <span className="text-[9px] font-dm font-bold text-primary block">Nivel Nuevo</span>
                <span className="font-mono text-base font-bold text-primary animate-pulse">{levelUpInfo.new}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary to-accent text-white rounded-xl py-3 shadow-blue-sm font-semibold transition-all hover:opacity-90 z-10 relative"
            >
              ¡Increíble, gracias!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
