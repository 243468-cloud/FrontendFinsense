'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Swords, Plus, Users, ShieldAlert } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { getChallenges, acceptChallenge, Challenge } from '@/services/challengeService';
import { formatCurrency, cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useUIStore } from '@/store/uiStore';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import { DuelsArena } from '@/components/gamification/DuelsArena';

export default function ChallengesPage() {
  const router = useRouter();
  const { openBottomSheet, addToast } = useUIStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadChallenges = () => {
    getChallenges()
      .then(setChallenges)
      .catch((e: any) => { console.error(e); })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleCreate = () => {
    openBottomSheet(<ChallengeForm onSuccess={loadChallenges} />);
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptChallenge(id);
      addToast({ message: 'Reto aceptado', type: 'success' });
      loadChallenges();
    } catch (e) {
      addToast({ message: 'Error al aceptar el reto', type: 'error' });
    }
  };

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-surface-3 transition-colors">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
              <Swords size={18} className="text-primary" /> Retos & Duelos
            </h1>
            <p className="font-dm text-xs text-text-secondary">Compite ahorrando con amigos</p>
          </div>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3.5 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm transition-all">
          <Plus size={14} />
          <span>Nuevo</span>
        </button>
      </header>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-10">
        
        {/* Duelos 1v1 Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-syne font-bold text-lg text-text-primary">Duelos 1v1</h2>
            <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Nuevo</div>
          </div>
          <DuelsArena />
        </section>

        {/* Retos Grupales Section */}
        <section>
          <h2 className="font-syne font-bold text-lg text-text-primary mb-4">Retos Grupales</h2>
          {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-surface-2 border border-border rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto">
            <Swords size={48} className="text-text-secondary/50 mx-auto mb-4" />
            <h3 className="font-syne font-bold text-lg text-text-primary mb-2">Sin retos activos</h3>
            <p className="font-dm text-sm text-text-secondary mb-4">
              Crea un reto de ahorro grupal (ej. "Mes sin gastar en antros") e invita a tus amigos a competir.
            </p>
            <button onClick={handleCreate} className="bg-primary text-white font-dm font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors inline-flex items-center gap-2">
              <Plus size={16} /> Crear Reto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(challenge => {
              const isFinished = challenge.status === 'completed';
              return (
                <div key={challenge.id} className="bg-surface rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-syne font-bold text-base text-text-primary">{challenge.title}</h3>
                        <p className="font-dm text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <Users size={12} /> {challenge.groupName}
                        </p>
                      </div>
                      {challenge.category && (
                        <div className="text-xl" title={challenge.category.name}>
                          {challenge.category.icon}
                        </div>
                      )}
                    </div>
                    {challenge.description && (
                      <p className="font-dm text-xs text-text-secondary mb-4 line-clamp-2">{challenge.description}</p>
                    )}
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between items-end">
                        <span className="font-dm text-xs text-text-secondary">Tu Gasto (Límite: {formatCurrency(challenge.targetAmount)})</span>
                        <span className="font-mono font-bold text-sm text-text-primary">{formatCurrency(challenge.userSpent)}</span>
                      </div>
                      <ProgressBar 
                        value={challenge.userSpent} 
                        max={challenge.targetAmount} 
                        color={challenge.userSpent >= challenge.targetAmount ? '#EF4444' : '#00C896'}
                        height="sm"
                      />
                      {challenge.userSpent >= challenge.targetAmount && (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                          <ShieldAlert size={12}/> Has superado el límite. Estás fuera.
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs font-dm text-text-secondary mb-4">
                      <span>Termina: {new Date(challenge.endDate).toLocaleDateString()}</span>
                      <span className="bg-surface-3 px-2 py-0.5 rounded text-[10px]">{challenge.participants.length} Participantes</span>
                    </div>
                  </div>
                  
                  {!challenge.accepted && challenge.status === 'active' ? (
                    <button 
                      onClick={() => handleAccept(challenge.id)}
                      className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-dm font-bold text-sm py-2 rounded-xl transition-colors"
                    >
                      Aceptar Reto
                    </button>
                  ) : isFinished ? (
                    <div className={cn("text-center py-2 rounded-xl font-dm font-bold text-sm", challenge.won ? "bg-success/10 text-success" : "bg-red-50 text-red-600")}>
                      {challenge.won ? '🏆 Ganaste el reto' : '❌ Perdiste el reto'}
                    </div>
                  ) : (
                    <div className="text-center py-2 rounded-xl font-dm font-bold text-sm bg-surface-2 text-text-secondary">
                      Participando
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </section>
      </div>
    </PageTransition>
  );
}
