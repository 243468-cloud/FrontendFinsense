'use client';
// BottomNav — barra de navegación inferior con FAB central
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart3, Target, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';


interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  isFAB?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard',    label: 'Inicio',      icon: Home,       href: '/dashboard' },
  { id: 'analytics',    label: 'Analíticas',  icon: BarChart3,  href: '/analytics' },
  { id: 'fab',          label: 'Agregar',     icon: Plus,       href: '/transactions/new', isFAB: true },
  { id: 'goals',        label: 'Metas',       icon: Target,     href: '/goals' },
  { id: 'groups',       icon: Users,      label: 'Grupos',   href: '/groups' },
];


export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
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
              (item.href !== '/transactions/new' && pathname.startsWith(item.href));
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
                onClick={() => router.push(item.href)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    size={22}
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-text-secondary'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
                  />
                </motion.div>

                <span
                  className={cn(
                    'text-xs font-dm transition-colors duration-200',
                    isActive ? 'text-primary font-semibold' : 'text-text-secondary'
                  )}
                >
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
