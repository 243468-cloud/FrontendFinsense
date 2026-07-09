'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Calendar, CreditCard, Play, Pause, Edit2, Trash2, ShieldCheck, Clock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { getSubscriptions, deleteSubscription, updateSubscription, Subscription } from '@/services/subscriptionService';
import { formatCurrency, cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { SubscriptionModal } from '@/components/subscriptions/SubscriptionModal';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | undefined>(undefined);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const activeTotal = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-surface-3 transition-colors p-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary">Suscripciones</h1>
            <p className="font-dm text-xs text-text-secondary">Pagos recurrentes</p>
          </div>
        </div>
        {subscriptions.length > 0 && (
          <button 
            onClick={() => { setSelectedSub(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-xl font-dm font-semibold text-xs sm:text-sm shadow-blue-md transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        )}
      </header>

      <div className="p-4 space-y-6 max-w-7xl mx-auto md:px-6 md:py-8">
        {/* Total Overview - Premium Look */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[32px] p-6 sm:p-8 text-white shadow-xl overflow-hidden border border-white/10"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/10 p-1.5 rounded-lg border border-white/5">
                  <ShieldCheck size={16} className="text-primary-light" />
                </div>
                <p className="font-dm text-white/70 text-sm font-medium">Gasto Mensual Activo</p>
              </div>
              {isLoading ? (
                <div className="h-12 w-48 shimmer-bg rounded-xl bg-white/10" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-syne text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                    {formatCurrency(activeTotal)}
                  </span>
                  <span className="font-dm text-white/50 text-sm">/ mes</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 md:flex-none min-w-[120px] transition-all hover:bg-white/10">
                <div className="flex justify-between items-start mb-2">
                  <Zap size={16} className="text-success" />
                  <span className="font-syne text-xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</span>
                </div>
                <p className="text-xs font-dm text-white/60">Activas</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 md:flex-none min-w-[120px] transition-all hover:bg-white/10">
                <div className="flex justify-between items-start mb-2">
                  <Pause size={16} className="text-white/50" />
                  <span className="font-syne text-xl font-bold text-white/80">{subscriptions.filter(s => s.status === 'paused').length}</span>
                </div>
                <p className="text-xs font-dm text-white/60">Pausadas</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {subscriptions.length === 0 && !isLoading ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-[32px] border border-border border-dashed text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              <CreditCard size={36} className="-rotate-12" />
            </div>
            <h3 className="font-syne font-bold text-xl text-text-primary mb-3">No hay suscripciones</h3>
            <p className="font-dm text-sm text-text-secondary max-w-sm mx-auto mb-8">
              Mantén el control de tus pagos recurrentes (Netflix, Spotify, gimnasio) en un solo lugar. Te avisaremos antes de cada cobro.
            </p>
            <button
              onClick={() => { setSelectedSub(undefined); setIsModalOpen(true); }}
              className="bg-primary text-white px-8 py-3.5 rounded-2xl font-dm font-semibold text-sm hover:bg-primary/90 transition-all shadow-blue-md flex items-center gap-2 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus size={18} />
              Agregar mi primera suscripción
            </button>
          </motion.div>
        ) : (
          /* Subscriptions List */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              subscriptions.map((sub) => {
                const isActive = sub.status === 'active';
                const daysLeft = differenceInDays(new Date(sub.nextBillingDate), new Date());
                const isClose = isActive && daysLeft <= 3 && daysLeft >= 0;

                return (
                  <motion.div
                    key={sub.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={cn(
                      "group bg-surface rounded-3xl p-5 border shadow-sm flex flex-col justify-between transition-all duration-300",
                      isActive ? "border-border hover:border-primary/30 hover:shadow-blue-sm" : "border-border/50 opacity-75 grayscale hover:grayscale-0",
                      isClose ? "border-orange-500/30 bg-gradient-to-b from-orange-50/30 to-transparent" : ""
                    )}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-colors",
                          isActive ? "bg-primary/5 text-primary border-primary/10" : "bg-surface-3 text-text-secondary border-border"
                        )}>
                          {sub.iconUrl ? (
                            <img src={sub.iconUrl} alt={sub.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <CreditCard size={24} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-syne font-bold text-text-primary text-lg leading-tight mb-1">{sub.name}</h3>
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-dm font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                            isActive ? "bg-success/20 text-success" : "bg-surface-3 text-text-secondary"
                          )}>
                            {isActive ? 'Activa' : 'Pausada'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button 
                            onClick={async () => {
                              await updateSubscription(sub.id, { status: isActive ? 'paused' : 'active' });
                              loadSubscriptions();
                            }}
                            className={cn("p-2 rounded-xl transition-colors", isActive ? "text-orange-500 hover:bg-orange-50" : "text-success hover:bg-success/10")}
                            title={isActive ? "Pausar" : "Reactivar"}
                          >
                            {isActive ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button 
                            onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm('¿Eliminar esta suscripción?')) {
                                await deleteSubscription(sub.id);
                                loadSubscriptions();
                              }
                            }}
                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between bg-surface-2 rounded-2xl p-4 border border-border/50">
                        <span className="font-dm text-xs text-text-secondary font-medium">Costo {sub.billingCycle === 'monthly' ? 'mensual' : 'anual'}</span>
                        <span className="font-mono text-lg font-bold text-text-primary">
                          {formatCurrency(sub.cost)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            isClose ? "bg-orange-100 text-orange-600" : "bg-surface-3 text-text-secondary"
                          )}>
                            <Clock size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-dm text-[10px] text-text-secondary uppercase font-semibold tracking-wider">Próximo cobro</span>
                            <span className={cn(
                              "font-dm text-xs font-semibold",
                              isClose ? 'text-orange-600' : 'text-text-primary'
                            )}>
                              {format(new Date(sub.nextBillingDate), "dd MMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                        {isClose && (
                          <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                            En {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSubscriptions}
        subscription={selectedSub}
      />
    </PageTransition>
  );
}
