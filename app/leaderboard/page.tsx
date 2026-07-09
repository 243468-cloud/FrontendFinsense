'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { getLeaderboard, LeaderboardEntry } from '@/services/leaderboardService';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch((e: any) => { console.error(e); })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center shadow-sm">
        <button onClick={() => router.push('/dashboard')} className="p-2 mr-3 rounded-xl hover:bg-surface-3 transition-colors">
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <div>
          <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Leaderboard
          </h1>
          <p className="font-dm text-xs text-text-secondary">Los mejores ahorradores locales</p>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {/* Podium (Top 3) */}
        {!isLoading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 mt-8 mb-12">
            {[1, 0, 2].map((idx) => {
              const entry = entries[idx];
              if (!entry) return null;
              
              const heights = ['h-32', 'h-40', 'h-24'];
              const colors = ['bg-slate-300', 'bg-yellow-400', 'bg-amber-700'];
              const borderColors = ['border-slate-400', 'border-yellow-500', 'border-amber-800'];
              const rank = idx === 0 ? 1 : idx === 1 ? 2 : 3;

              return (
                <div key={entry.userId} className="flex flex-col items-center flex-1 max-w-[120px]">
                  <div className="relative mb-3">
                    <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 overflow-hidden relative", borderColors[idx])}>
                      {entry.avatar ? (
                        entry.avatar.startsWith('http') || entry.avatar.startsWith('/') || entry.avatar.startsWith('data:') ? (
                          <Image src={entry.avatar} alt={entry.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne text-xl">
                            {entry.avatar}
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne font-bold text-xl text-primary">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {rank === 1 && (
                      <div className="absolute -top-4 -right-2 text-2xl animate-bounce">👑</div>
                    )}
                  </div>
                  
                  <p className="font-dm font-bold text-xs sm:text-sm text-center text-text-primary truncate w-full px-1">{entry.name}</p>
                  <p className="font-mono font-bold text-[10px] sm:text-xs text-primary mb-2">{entry.xp} XP</p>
                  
                  <div className={cn("w-full rounded-t-xl flex flex-col items-center justify-start pt-4 relative overflow-hidden shadow-inner", heights[idx], colors[idx])}>
                    <div className="absolute inset-0 bg-white/20" />
                    <span className="relative z-10 font-syne font-bold text-3xl sm:text-4xl text-black/40">{rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry, i) => {
                const prevEntry = i > 0 ? entries[i - 1] : null;
                const showLeagueHeader = !prevEntry || prevEntry.league !== entry.league;
                
                const getLeagueColor = (league: string) => {
                  switch(league) {
                    case 'Diamante': return 'text-cyan-500';
                    case 'Oro': return 'text-yellow-500';
                    case 'Plata': return 'text-slate-400';
                    default: return 'text-amber-700';
                  }
                };

                return (
                  <div key={entry.userId}>
                    {showLeagueHeader && (
                      <div className="bg-surface-2/80 px-4 py-2 border-b border-border flex items-center gap-2">
                        <span className={cn("font-syne font-bold text-xs uppercase tracking-wider", getLeagueColor(entry.league))}>
                          Liga {entry.league}
                        </span>
                      </div>
                    )}
                    <div className={cn("flex items-center gap-4 p-4 transition-colors", entry.isCurrentUser ? "bg-primary/5" : "hover:bg-surface-2")}>
                      <div className="w-6 text-center font-syne font-bold text-text-secondary text-lg">
                        {i + 1}
                      </div>
                      
                      <div className="w-10 h-10 rounded-full border-2 border-border overflow-hidden relative flex-shrink-0">
                        {entry.avatar ? (
                          entry.avatar.startsWith('http') || entry.avatar.startsWith('/') || entry.avatar.startsWith('data:') ? (
                            <Image src={entry.avatar} alt={entry.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne text-xl">
                              {entry.avatar}
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full bg-surface-3 flex items-center justify-center font-syne font-bold text-sm text-primary">
                            {entry.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-dm font-bold text-sm text-text-primary truncate flex items-center gap-2">
                          {entry.name}
                          {entry.isCurrentUser && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Tú</span>}
                        </p>
                        <p className="font-dm text-xs text-text-secondary truncate">{entry.city} · Nivel {entry.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-mono font-bold text-primary">{entry.xp}</p>
                        <p className="font-dm text-[10px] text-text-secondary uppercase">XP</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {entries.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-dm text-text-secondary">Aún no hay usuarios en el leaderboard.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
