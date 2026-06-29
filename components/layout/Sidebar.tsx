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
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#0B1530] border-r border-white/10 text-white"
      aria-label="Menú principal"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" aria-label="FinSense — Inicio">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-syne font-bold text-sm">FS</span>
          </div>
          <span className="font-syne font-bold text-xl text-white">FinSense</span>
        </Link>
      </div>

      {/* Add transaction CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 w-full bg-gradient-to-r from-[#0057FF] to-[#00C2FF] text-white rounded-xl px-4 py-3 font-dm font-semibold text-sm shadow-blue-lg hover:shadow-[0_8px_30px_rgba(0,194,255,0.4)] transition-all duration-200 hover:-translate-y-0.5 justify-center"
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
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
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
                  className="ml-auto w-1.5 h-5 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 flex-1 min-w-0 group hover:opacity-90 transition-opacity"
              aria-label="Ver perfil"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-sm flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-dm font-semibold text-sm text-white truncate">
                  {user.name}
                </p>
                <p className="font-dm text-xs text-white/60 truncate">
                  Nv. {user.level} · {user.xp} XP
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 touch-target"
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
