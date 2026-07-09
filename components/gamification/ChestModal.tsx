'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Star, Shirt, X } from 'lucide-react';
import { openChest } from '@/services/gamificationService';

interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
}

export function ChestModal({ isOpen, onClose, onRewardClaimed }: ChestModalProps) {
  const [clicks, setClicks] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{ type: string, amount: number, itemId: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setClicks(0);
      setIsOpening(false);
      setReward(null);
      setError(null);
    }
  }, [isOpen]);

  const handleChestClick = async () => {
    if (isOpening || reward) return;
    
    setClicks(prev => prev + 1);
    
    if (clicks >= 3) {
      setIsOpening(true);
      try {
        const res = await openChest();
        setReward({ type: res.rewardType, amount: res.amount, itemId: res.itemId });
        onRewardClaimed();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error al abrir el cofre');
      } finally {
        setIsOpening(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-surface border border-border rounded-3xl p-6 sm:p-10 w-full max-w-sm text-center relative shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>

          {!reward && !error && (
            <>
              <h2 className="font-syne text-2xl font-bold text-text-primary mb-2">¡Cofre Misterioso!</h2>
              <p className="font-dm text-sm text-text-secondary mb-8">
                Toca el cofre 4 veces para abrirlo.
              </p>

              <div className="relative flex justify-center mb-6">
                <motion.div
                  onClick={handleChestClick}
                  animate={{
                    scale: clicks > 0 ? [1, 1.1, 1] : 1,
                    rotate: clicks > 0 ? [0, -10, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl shadow-[0_0_40px_rgba(251,191,36,0.4)] flex items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 blur-md" />
                  <div className="w-full h-4 bg-yellow-900/40 absolute top-1/2 -translate-y-1/2" />
                  <div className="w-6 h-8 bg-yellow-300 border-2 border-yellow-900 rounded-sm absolute" />
                  <Sparkles className="absolute top-2 right-2 text-yellow-200" size={16} />
                </motion.div>
                
                {clicks > 0 && clicks < 4 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-8 text-primary font-bold text-lg"
                  >
                    {clicks}/4
                  </motion.div>
                )}
              </div>
            </>
          )}

          {isOpening && !reward && !error && (
            <div className="py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"
              />
            </div>
          )}

          {error && (
            <div className="py-10">
              <p className="text-red-500 font-bold mb-4">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-surface-2 rounded-xl text-text-primary hover:bg-surface-3 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}

          {reward && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="py-4"
            >
              <h2 className="font-syne text-2xl font-bold text-text-primary mb-6">¡Recompensa!</h2>
              
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                {reward.type === 'coins' && <Coins size={40} className="text-yellow-400" />}
                {reward.type === 'xp' && <Star size={40} className="text-primary" />}
                {reward.type === 'skin' && <Shirt size={40} className="text-accent" />}
              </div>

              <div className="text-3xl font-bold text-text-primary mb-2">
                {reward.type === 'skin' ? '¡Skin Rara!' : `+${reward.amount}`}
              </div>
              <p className="text-text-secondary font-dm mb-6">
                {reward.type === 'coins' && 'FinCoins obtenidos'}
                {reward.type === 'xp' && 'Puntos de Experiencia'}
                {reward.type === 'skin' && `Skin: ${reward.itemId?.replace('skin_', '')}`}
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-blue-sm hover:bg-primary-dark transition-all"
              >
                Genial
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
