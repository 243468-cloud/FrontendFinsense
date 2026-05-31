'use client';
// Sidebar — navegación lateral para desktop (≥768px)
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Receipt, Target, Users, BarChart3, User, Plus, LogOut,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';

const navItems = [
  { id: 'dashboard',    label: 'Inicio',      icon: Home,     href: '/dashboard' },
  { id: 'transactions', label: 'Transacciones',icon: Receipt,  href: '/transactions/new' },
  { id: 'goals',        label: 'Metas',        icon: Target,   href: '/goals' },
  { id: 'groups',       label: 'Grupos',       icon: Users,    href: '/groups' },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3,href: '/analytics' },
  { id: 'profile',     label: 'Perfil',       icon: User,     href: '/profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    storeLogout();
    router.push('/auth');
  }

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface border-r border-border"
      aria-label="Menú principal"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" aria-label="FinSense — Inicio">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-syne font-bold text-sm">FS</span>
          </div>
          <span className="font-syne font-bold text-xl text-text-primary">FinSense</span>
        </Link>
      </div>

      {/* Add transaction CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 w-full bg-gradient-to-r from-primary to-primary-light text-white rounded-xl px-4 py-2.5 font-dm font-semibold text-sm hover:shadow-blue-lg transition-all duration-200"
        >
          <Plus size={18} aria-hidden="true" />
          Agregar transacción
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Secciones">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/transactions/new' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-dm font-medium text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
              </motion.div>
              {item.label}

              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-sm flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-dm font-semibold text-sm text-text-primary truncate">
                {user.name}
              </p>
              <p className="font-dm text-xs text-text-secondary truncate">
                Nv. {user.level} · {user.xp} XP
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-text-secondary hover:text-red-500 transition-colors touch-target"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
