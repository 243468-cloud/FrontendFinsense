'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CreditCard, Target, Wallet, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { getSubscriptions, Subscription, deleteSubscription } from '@/services/subscriptionService';
import { getGoals, deleteGoal } from '@/services/goalService';
import type { Goal } from '@/types/goal.types';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, cn, getIconForEmoji } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { getCalendarEvents, addCalendarEvent, deleteCalendarEvent } from '@/services/calendarEventService';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { Trash2 } from 'lucide-react';

type Event = {
  id: string;
  date: Date;
  title: string;
  amount?: number;
  type: 'subscription' | 'goal' | 'income' | 'custom';
  icon: any;
  color: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchAllEvents = () => {
    setIsLoading(true);
    Promise.all([getSubscriptions(), getGoals(), getCalendarEvents()]).then(([subs, goals, customEvents]) => {
      const allEvents: Event[] = [];
      
      // Add Subscriptions for next 30 days
      subs.forEach(s => {
        if (s.status === 'active') {
          allEvents.push({
            id: `sub_${s.id}`,
            date: new Date(s.nextBillingDate),
            title: `Pago de ${s.name}`,
            amount: s.cost,
            type: 'subscription',
            icon: CreditCard,
            color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
          });
        }
      });

      // Add Goals deadlines
      goals.forEach(g => {
        allEvents.push({
          id: `goal_${g.id}`,
          date: new Date(g.deadline),
          title: `Límite: ${g.title}`,
          amount: g.targetAmount,
          type: 'goal',
          icon: Target,
          color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
        });
      });

      // Add Custom Events
      customEvents.forEach(c => {
        allEvents.push({
          id: `custom_${c.id}`,
          date: new Date(c.date),
          title: c.title,
          amount: c.amount,
          type: 'custom',
          icon: c.emoji ? getIconForEmoji(c.emoji) : CalendarIcon,
          color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
        });
      });


      // Sort
      allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(allEvents);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleAddEvent = async (data: { title: string; amount?: number; date: string; emoji: string }) => {
    try {
      await addCalendarEvent(data);
      fetchAllEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (confirm('¿Estás seguro de que deseas eliminar este evento del calendario?')) {
      try {
        if (event.type === 'custom') {
          await deleteCalendarEvent(event.id.replace('custom_', ''));
        } else if (event.type === 'subscription') {
          await deleteSubscription(event.id.replace('sub_', ''));
        } else if (event.type === 'goal') {
          await deleteGoal(event.id.replace('goal_', ''));
        }
        fetchAllEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Generate a mini 14-day slider
  const daysSlider = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  const eventsForSelected = events.filter(e => isSameDay(e.date, selectedDate));

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-surface-3 transition-colors">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
              <CalendarIcon size={18} className="text-primary"/> Calendario
            </h1>
            <p className="font-dm text-xs text-text-secondary">Próximos eventos financieros</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white p-2 sm:px-4 sm:py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-sm"
        >
          <span className="hidden sm:inline font-dm text-sm font-bold">Añadir Evento</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </header>

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        
        {/* View Toggle */}
        <div className="flex bg-surface border border-border p-1 rounded-2xl w-fit shadow-sm mx-auto md:mx-0">
          <button
            onClick={() => setViewMode('agenda')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              viewMode === 'agenda' ? "bg-primary text-white shadow-blue-sm" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
            )}
          >
            <List size={16} /> Agenda
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              viewMode === 'month' ? "bg-primary text-white shadow-blue-sm" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
            )}
          >
            <LayoutGrid size={16} /> Mes
          </button>
        </div>

        {viewMode === 'agenda' ? (
          <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {daysSlider.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const hasEvents = events.some(e => isSameDay(e.date, date));

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[4rem] p-3 rounded-xl transition-all border",
                      isSelected 
                        ? "bg-primary border-primary text-white shadow-blue-sm scale-105" 
                        : "bg-surface-2 border-border text-text-secondary hover:bg-surface-3"
                    )}
                  >
                    <span className="font-dm text-[10px] uppercase font-bold tracking-wider mb-1">
                      {format(date, 'EEE', { locale: es })}
                    </span>
                    <span className={cn("font-syne text-xl font-bold leading-none mb-1", isSelected ? "text-white" : "text-text-primary")}>
                      {format(date, 'd')}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full mt-1" style={{ backgroundColor: hasEvents ? (isSelected ? 'white' : '#EF4444') : 'transparent' }}/>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-surface p-4 md:p-6 rounded-3xl shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-syne font-bold text-lg md:text-xl text-text-primary capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border transition-colors text-text-secondary hover:text-text-primary">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border transition-colors text-text-secondary hover:text-text-primary">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center font-syne text-sm font-bold text-text-secondary pb-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
                const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start, end });
                
                return days.map((date, idx) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const hasEvents = events.some(e => isSameDay(e.date, date));
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(date);
                        if (!isCurrentMonth) setCurrentMonth(startOfMonth(date));
                      }}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-xl md:rounded-2xl transition-all border relative group",
                        !isCurrentMonth && "opacity-30",
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-blue-sm scale-105 z-10" 
                          : "bg-surface-2 border-transparent text-text-primary hover:bg-surface-3 hover:border-border"
                      )}
                    >
                      <span className={cn("font-syne text-sm md:text-lg font-bold leading-none")}>
                        {format(date, 'd')}
                      </span>
                      {hasEvents && (
                        <div className="absolute bottom-1.5 md:bottom-2.5 flex gap-1">
                          {events.filter(e => isSameDay(e.date, date)).slice(0, 3).map((e, i) => (
                            <div key={i} className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", isSelected ? "bg-white" : e.type === 'income' ? 'bg-success' : e.type === 'subscription' ? 'bg-orange-500' : e.type === 'goal' ? 'bg-blue-500' : 'bg-purple-500')} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Selected Date Events */}
        <div>
          <h2 className="font-syne font-bold text-xl mb-4 text-text-primary capitalize flex items-center gap-2">
            <Clock size={20} className="text-text-secondary"/>
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h2>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
            ) : eventsForSelected.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center p-8 bg-surface rounded-2xl border border-border border-dashed">
                <CalendarIcon size={32} className="mx-auto text-text-secondary mb-2 opacity-50" />
                <p className="font-dm text-text-secondary">No hay eventos financieros para este día.</p>
              </motion.div>
            ) : (
              eventsForSelected.map((event) => (
                <motion.div key={event.id} variants={itemVariants} className="bg-surface p-4 rounded-xl shadow-sm border border-border flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", event.color)}>
                    <event.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-syne font-bold text-text-primary">{event.title}</h3>
                    <p className="font-dm text-xs text-text-secondary uppercase">{event.type}</p>
                  </div>
                  {event.amount && (
                    <div className="text-right mr-2">
                      <span className={cn(
                        "font-mono font-bold text-lg",
                        event.type === 'subscription' ? 'text-text-primary' : 'text-primary'
                      )}>
                        {event.type === 'subscription' ? '-' : ''}{formatCurrency(event.amount)}
                      </span>
                    </div>
                  )}
                  {event.type !== 'income' && (
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Eliminar evento"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Upcoming List */}
        <div className="pt-6 border-t border-border mt-8">
          <h3 className="font-syne font-bold text-lg mb-4 text-text-primary">Próximos a la vista</h3>
          <div className="space-y-2">
            {events.filter(e => e.date > selectedDate).slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", event.color)}>
                    <event.icon size={16} />
                  </div>
                  <div>
                    <p className="font-dm text-sm font-semibold text-text-primary">{event.title}</p>
                    <p className="font-dm text-[10px] text-text-secondary capitalize">{format(event.date, "dd MMM", { locale: es })}</p>
                  </div>
                </div>
                {event.amount && (
                  <span className="font-mono text-sm font-bold text-text-secondary mr-2">
                    {formatCurrency(event.amount)}
                  </span>
                )}
                {event.type !== 'income' && (
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Eliminar evento"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <AddEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEvent}
        selectedDate={selectedDate}
      />
    </PageTransition>
  );
}
