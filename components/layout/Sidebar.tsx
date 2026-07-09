'use client';
// Sidebar — navegación lateral para desktop (≥768px)
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Receipt, Target, Users, BarChart3, User, Plus, LogOut, Flame, Settings, PieChart, CreditCard, ShoppingBag, Calendar, TrendingUp, PanelLeftClose, PanelLeftOpen, Gamepad2
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';

const navItems = [
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

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout: storeLogout } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    storeLogout();
    router.push('/auth');
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-surface border-r border-border text-text-primary transition-[width] duration-300 ease-in-out z-30 shrink-0",
        isSidebarCollapsed ? "w-[80px]" : "w-64"
      )}
      aria-label="Menú principal"
    >
      {/* Logo */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <Link href="/dashboard" className={cn("flex items-center gap-2.5 group overflow-hidden", isSidebarCollapsed && "justify-center w-full")} aria-label="FinSense — Inicio">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-syne font-bold text-sm">FS</span>
          </div>
          {!isSidebarCollapsed && <span className="font-syne font-bold text-xl text-text-primary whitespace-nowrap">FinSense</span>}
        </Link>
        {!isSidebarCollapsed && (
          <button onClick={toggleSidebar} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors shrink-0">
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>
      
      {isSidebarCollapsed && (
        <div className="flex justify-center pb-2">
          <button onClick={toggleSidebar} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <PanelLeftOpen size={20} />
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1.5 mt-2 overflow-y-auto scrollbar-hide pb-4" aria-label="Secciones">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/transactions/new' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-xl font-dm font-medium text-sm transition-all duration-150 group relative',
                isActive
                  ? 'bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent border-primary/20 dark:border-accent/20'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary dark:hover:text-white',
                isSidebarCollapsed ? 'justify-center' : 'gap-3'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="shrink-0"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
              </motion.div>
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

              {isActive && !isSidebarCollapsed && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-3 w-1.5 h-5 bg-accent rounded-full shrink-0"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && isSidebarCollapsed && (
                <motion.div
                  layoutId="sidebar-indicator-collapsed"
                  className="absolute right-1 w-1 h-5 bg-accent rounded-full shrink-0"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Gamification / Quick Action Card to fill dead space */}
      {user && !isSidebarCollapsed && (
        <div className="px-4 mb-4 mt-auto">
          <div className="bg-gradient-to-br from-primary/10 dark:from-accent/10 to-accent/10 border border-primary/20 dark:border-accent/20 rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 mx-auto bg-primary/20 dark:bg-accent/20 rounded-full flex items-center justify-center mb-2">
              <Flame size={20} className="text-primary dark:text-accent" />
            </div>
            <h4 className="font-syne font-bold text-text-primary text-sm mb-1">¡Mantén tu racha!</h4>
            <p className="font-dm text-xs text-text-secondary mb-3">Registra gastos para no perder tu progreso de {user.streakDays} días.</p>
            <Link
              href="/transactions/new"
              className="block w-full py-2 bg-primary dark:bg-accent text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:bg-primary-dark dark:hover:bg-accent/90 transition-colors shadow-blue-sm dark:shadow-[0_4px_20px_rgba(0,194,255,0.30)]"
            >
              Nueva Transacción
            </Link>
          </div>
        </div>
      )}

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-border bg-surface shrink-0">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              {user.avatar ? (
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-xl shadow-sm border border-border shrink-0">
                  {user.avatar}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary shadow-sm border border-border shrink-0">
                  {getInitials(user.name)}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-hidden">
              {user.avatar ? (
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-xl shadow-sm border border-border shrink-0">
                  {user.avatar}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary shadow-sm border border-border shrink-0">
                  {getInitials(user.name)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-syne font-bold text-sm text-text-primary truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">Nivel {user.level}</span>
                  <span className="text-[10px] text-text-secondary">•</span>
                  <span className="text-[10px] text-primary dark:text-accent flex items-center gap-0.5 font-bold whitespace-nowrap">
                    {user.streakDays}d <Flame size={10} className="text-primary dark:text-accent"/>
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
