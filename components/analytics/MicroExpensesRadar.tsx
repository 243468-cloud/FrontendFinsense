'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { formatCurrency } from '@/lib/utils';
import { SkeletonCard } from '../ui/SkeletonCard';

interface Leak {
  name: string;
  count: number;
  total: number;
  emoji: string;
  color: string;
}

export function MicroExpensesRadar() {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [totalLeaked, setTotalLeaked] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFugas() {
      try {
        const res = await apiClient.get('/analytics/fugas');
        if (res.data) {
          setLeaks(res.data.leaks || []);
          setTotalLeaked(res.data.totalLeaked || 0);
        }
      } catch (error) {
        console.error('Error fetching fugas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFugas();
  }, []);

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  if (leaks.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-card flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <Droplets className="text-success" size={32} />
        </div>
        <h3 className="text-lg font-syne font-bold text-text-primary">¡Sin fugas de dinero!</h3>
        <p className="text-sm font-dm text-text-secondary mt-2">
          No detectamos gastos hormiga recurrentes en los últimos 30 días. ¡Excelente control!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border shadow-card relative overflow-hidden flex flex-col h-full">
      {/* Background Water Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-syne font-bold text-text-primary flex items-center gap-2">
            <Droplets className="text-blue-500" size={20} />
            Radar de Gastos Hormiga
          </h3>
          <p className="text-sm font-dm text-text-secondary mt-1 max-w-sm">
            Pequeños gastos que se repiten y drenan tu presupuesto mensual sin que lo notes.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-dm font-bold text-text-secondary uppercase tracking-wider">Total Fugado</p>
          <p className="text-2xl font-mono font-bold text-red-500">{formatCurrency(totalLeaked)}</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {leaks.map((leak, index) => (
          <motion.div
            key={leak.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 bg-surface-2 p-3 rounded-xl border border-border/50"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${leak.color}20`, color: leak.color }}
            >
              {leak.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-syne font-bold text-text-primary truncate">{leak.name}</h4>
              <p className="text-xs font-dm text-text-secondary flex items-center gap-1">
                <AlertTriangle size={12} className="text-orange-500" />
                Se repitió {leak.count} veces
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-text-primary">{formatCurrency(leak.total)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
