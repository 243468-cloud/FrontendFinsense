'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface HeatmapDay {
  date: string;
  amount: number;
  level: number; // 0 to 4
}

const GITHUB_LEVEL_COLORS = [
  'bg-surface-3 border border-border', // Level 0: no spend
  'bg-success/10 border border-success/20',
  'bg-success/25 border border-success/40',
  'bg-success/50 border border-success/60 text-white',
  'bg-success border border-success text-white',
];

export default function SpendingHeatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get('/analytics/heatmap')
      .then(res => {
        setData(res.data);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
          }
        }, 100);
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute offset for the first day
  const emptyPrefix = [];
  if (data.length > 0) {
    const startDate = new Date(data[0].date + 'T00:00:00');
    const dayOfWeek = startDate.getDay(); // 0 = Sunday
    for (let i = 0; i < dayOfWeek; i++) {
      emptyPrefix.push(i);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-bold text-lg text-text-primary">Mapa de Gastos</h2>
          <p className="font-dm text-xs text-text-secondary mt-1">Tu historial de los últimos 365 días</p>
        </div>
        <button className="text-text-secondary hover:text-primary transition-colors">
          <HelpCircle size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-[120px] w-full shimmer-bg rounded-xl" />
      ) : (
        <div className="relative flex flex-col items-center">
          <div ref={scrollRef} className="w-full overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
            <div className="inline-grid grid-rows-7 grid-flow-col gap-[3px] mx-auto">
              {emptyPrefix.map((_, i) => (
                <div key={`empty-${i}`} className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] bg-transparent" />
              ))}
              
              {data.map((day, i) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-primary/50 hover:z-10 ${GITHUB_LEVEL_COLORS[day.level]}`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-2 w-full max-w-[680px] flex items-center justify-end gap-2 text-[10px] font-dm text-text-secondary">
            <span>Menos</span>
            <div className="flex gap-[3px]">
              {GITHUB_LEVEL_COLORS.map((color, i) => (
                <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${color}`} />
              ))}
            </div>
            <span>Más</span>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredDay && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-3/95 backdrop-blur-md border border-border shadow-lg rounded-xl p-3 z-20 pointer-events-none w-48 text-center"
              >
                <span className="block font-syne font-bold text-sm text-text-primary mb-1">
                  ${hoveredDay.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="block font-dm text-xs text-text-secondary">
                  {new Date(hoveredDay.date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
