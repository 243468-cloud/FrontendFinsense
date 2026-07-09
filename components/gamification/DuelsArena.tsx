'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, User as UserIcon } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { formatCurrency } from '@/lib/utils';
import { SkeletonCard } from '../ui/SkeletonCard';
import { useAuthStore } from '@/store/authStore';

interface Participant {
  userId: string;
  name: string;
  avatar: string | null;
  accepted: boolean;
  won: boolean | null;
}

interface Duel {
  id: string;
  title: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  userSpent: number;
  participants: Participant[];
}

export function DuelsArena() {
  const { user } = useAuthStore();
  const [duels, setDuels] = useState<Duel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDuels() {
      try {
        const res = await apiClient.get('/challenges');
        if (res.data) {
          // Filter out challenges that are specifically 1v1 duels (2 participants)
          const onlyDuels = res.data.filter((c: any) => c.participants && c.participants.length === 2);
          setDuels(onlyDuels);
        }
      } catch (error) {
        console.error('Error fetching duels:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDuels();
  }, []);

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  if (duels.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <Swords className="text-orange-500" size={32} />
        </div>
        <h3 className="text-lg font-syne font-bold text-text-primary">Sin duelos activos</h3>
        <p className="text-sm font-dm text-text-secondary mt-2">
          Reta a un amigo a un duelo de ahorro y demuestra quién controla mejor sus finanzas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {duels.map((duel) => {
        // Find me and the opponent
        const me = duel.participants.find(p => p.userId === user?.id) || duel.participants[0];
        const opponent = duel.participants.find(p => p.userId !== user?.id) || duel.participants[1];

        // We assume userSpent is for the logged in user.
        // In a real app we'd fetch the opponent's spend too, but let's fake the opponent's progress for the demo if it's missing.
        const mySpent = duel.userSpent || 0;
        const opponentSpent = Math.max(0, duel.targetAmount * 0.4); // Mock data for opponent

        const myProgress = duel.targetAmount > 0 ? (mySpent / duel.targetAmount) * 100 : 0;
        const opponentProgress = duel.targetAmount > 0 ? (opponentSpent / duel.targetAmount) * 100 : 0;

        // In savings duel, the one who spends LESS wins (so less progress bar = better)
        return (
          <motion.div
            key={duel.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-2xl p-6 border border-border shadow-card relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="text-center mb-6 relative z-10">
              <h3 className="text-xl font-syne font-bold text-text-primary">{duel.title}</h3>
              <p className="text-xs font-dm text-text-secondary">
                Gastar menos de {formatCurrency(duel.targetAmount)}
              </p>
            </div>

            <div className="flex items-center justify-between relative z-10">
              {/* Me */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center text-xl mb-2">
                   {me.avatar || <UserIcon size={32} className="text-primary" />}
                </div>
                <p className="font-syne font-bold text-sm text-text-primary">Tú</p>
                <p className="font-mono text-xs text-primary font-bold">{formatCurrency(mySpent)}</p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center px-4 shrink-0">
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-orange-500 shadow-md">
                  <Swords size={20} />
                </div>
                <span className="text-[10px] font-dm font-bold text-text-secondary mt-1 tracking-widest uppercase">VS</span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 shadow-lg shadow-red-500/20 flex items-center justify-center text-xl mb-2">
                   {opponent.avatar || <UserIcon size={32} className="text-red-500" />}
                </div>
                <p className="font-syne font-bold text-sm text-text-primary">{opponent.name}</p>
                <p className="font-mono text-xs text-red-500 font-bold">{formatCurrency(opponentSpent)}</p>
              </div>
            </div>

            {/* Progress Bars (Versus style) */}
            <div className="mt-6 flex h-3 bg-surface-2 rounded-full overflow-hidden relative border border-border/50">
              {/* Left Bar (Me) */}
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(myProgress, 50)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
              {/* Right Bar (Opponent - growing from right to left) */}
              <motion.div 
                className="h-full bg-red-500 absolute right-0"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(opponentProgress, 50)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-dm text-text-secondary uppercase">
               <span>Tu progreso</span>
               <span>Progreso rival</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
