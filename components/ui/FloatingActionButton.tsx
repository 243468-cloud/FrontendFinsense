'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowDown, ArrowUp, Mic } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';

export function FloatingActionButton() {
  const { isFABOpen, toggleFAB, closeFAB } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!pathname || pathname === '/' || pathname.startsWith('/auth') || pathname.includes('/new') || pathname.startsWith('/settings')) return null;

  const actions = [
    { id: 'income', label: 'Ingreso', icon: ArrowUp, color: 'bg-success', href: '/transactions/new?type=income' },
    { id: 'expense', label: 'Gasto', icon: ArrowDown, color: 'bg-red-500', href: '/transactions/new?type=expense' },
    { id: 'voice', label: 'Voz', icon: Mic, color: 'bg-purple-500', href: '/transactions/new?voice=true' },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-[99] flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isFABOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-4 items-end mb-2"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => {
                  closeFAB();
                  router.push(action.href);
                }}
                className="flex items-center gap-3 group"
              >
                <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 px-4 py-2 rounded-2xl text-sm font-semibold shadow-xl border border-white/20 dark:border-white/10 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-300">
                  {action.label}
                </span>
                <div className={`${action.color} text-white p-3.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-110 group-active:scale-95 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <action.icon size={22} className="relative z-10" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleFAB}
        animate={!isFABOpen ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-16 h-16 rounded-full bg-gradient-primary shadow-blue-lg hover:shadow-blue-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-white/30"
        aria-label="Acciones rápidas"
      >
        <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <AnimatePresence mode="wait">
          {isFABOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Plus size={32} className="text-white rotate-45" />
            </motion.div>
          ) : (
            <motion.div
              key="face"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2.5 relative z-10 items-center justify-center"
            >
              <motion.div 
                animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[11px] h-[11px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)]" 
              />
              <motion.div 
                animate={{ scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[11px] h-[11px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)]" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
