'use client';
// BottomNav — barra de navegación inferior con FAB central
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart3, Target, Users, Plus, Menu, Calendar, Receipt, PieChart, CreditCard, ShoppingBag, TrendingUp, User, Settings, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  isFAB?: boolean;
  isMenu?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: Home, href: '/dashboard' },
  { id: 'analytics', label: 'Analíticas', icon: BarChart3, href: '/analytics' },
  { id: 'fab', label: 'Agregar', icon: Plus, href: '/transactions/new', isFAB: true },
  { id: 'goals', label: 'Metas', icon: Target, href: '/goals' },
  { id: 'menu', icon: Menu, label: 'Menú', href: '#', isMenu: true },
];

const allMenuOptions = [
  { id: 'dashboard',    label: 'Inicio',      icon: Home,     href: '/dashboard' },
  { id: 'calendar',     label: 'Calendario',  icon: Calendar, href: '/calendar' },
  { id: 'transactions', label: 'Transacciones',icon: Receipt,  href: '/transactions/new' },
  { id: 'goals',        label: 'Metas',        icon: Target,   href: '/goals' },
  { id: 'budgets',      label: 'Presupuestos', icon: PieChart, href: '/budgets' },
  { id: 'subscriptions',label: 'Suscripciones',icon: CreditCard,href:'/subscriptions' },
  { id: 'store',        label: 'Tienda',       icon: ShoppingBag,href: '/store' },
  { id: 'groups',       label: 'Grupos',       icon: Users,    href: '/groups' },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3,href: '/analytics' },
  { id: 'investments', label: 'Inversiones',  icon: TrendingUp,href:'/investments' },
  { id: 'games',       label: 'Juegos',       icon: Gamepad2, href: '/games' },
  { id: 'profile',     label: 'Perfil',       icon: User,     href: '/profile' },
  { id: 'settings',    label: 'Configuración',icon: Settings, href: '/settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
        aria-label="Navegación principal"
      >
        {/* Safe area padding */}
        <div
          className="bg-surface/95 backdrop-blur-xl border-t border-border"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 24px rgba(0, 87, 255, 0.08)',
          }}
        >
          <div className="flex items-end justify-around px-2 h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/transactions/new' && item.href !== '#' && pathname.startsWith(item.href));
              const Icon = item.icon;

              if (item.isFAB) {
                return (
                  <motion.button
                    key={item.id}
                    className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-blue-lg touch-target"
                    onClick={() => router.push(item.href)}
                    aria-label={item.label}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                  >
                    <Icon size={24} strokeWidth={2.5} aria-hidden="true" />
                  </motion.button>
                );
              }

              return (
                <button
                  key={item.id}
                  className="flex flex-col items-center gap-0.5 flex-1 py-2 touch-target relative"
                  onClick={() => {
                    if (item.isMenu) {
                      setIsMenuOpen(true);
                    } else {
                      router.push(item.href);
                    }
                  }}
                  aria-label={item.label}
                  aria-current={isActive && !item.isMenu ? 'page' : undefined}
                >
                  <motion.div
                    animate={isActive && !item.isMenu ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      size={22}
                      className={cn(
                        'transition-colors duration-200',
                        isActive && !item.isMenu ? 'text-primary dark:text-accent' : 'text-text-secondary dark:text-slate-400'
                      )}
                      strokeWidth={isActive && !item.isMenu ? 2.5 : 2}
                      aria-hidden="true"
                    />
                  </motion.div>

                  <span
                    className={cn(
                      'text-xs font-dm transition-colors duration-200',
                      isActive && !item.isMenu ? 'text-primary dark:text-accent font-semibold' : 'text-text-secondary dark:text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>

                  {isActive && !item.isMenu && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary dark:bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <BottomSheet
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Menú Principal"
      >
        <div className="p-4 grid grid-cols-3 gap-4 pb-12">
          {allMenuOptions.map((option) => {
            const Icon = option.icon;
            const isActive = pathname === option.href ||
                (option.href !== '/transactions/new' && pathname.startsWith(option.href));
                
            return (
              <button
                key={option.id}
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(option.href);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-surface-2 transition-colors active:scale-95 touch-target"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-primary dark:bg-accent text-white shadow-blue-sm dark:shadow-[0_4px_20px_rgba(0,194,255,0.30)]" : "bg-surface-2 text-text-primary border border-border"
                )}>
                  <Icon size={24} />
                </div>
                <span className={cn(
                  "text-xs font-dm text-center",
                  isActive ? "font-bold text-primary dark:text-accent" : "text-text-secondary"
                )}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
