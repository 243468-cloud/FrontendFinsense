'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, MapPin, Calendar, Award, Flame, LogOut, ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logout as serviceLogout } from '@/services/authService';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout: storeLogout } = useAuthStore();

  const handleLogout = () => {
    serviceLogout();
    storeLogout();
    router.replace('/auth');
  };

  if (!user) return null;

  // XP Progress Calculation
  const xpPercentage = Math.min(100, Math.max(0, (user.xp / (user.xpToNextLevel || 500)) * 100));

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-10 h-10 rounded-xl hover:bg-surface-3 flex items-center justify-center text-text-primary transition-colors"
          aria-label="Regresar al Dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-syne font-bold text-lg text-text-primary">Mi Perfil</h1>
          <p className="font-dm text-xs text-text-secondary">Configuración y estadísticas</p>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 max-w-xl mx-auto">
        {/* ─── Avatar & Basic Info ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface border border-border rounded-3xl p-6 shadow-card text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-purple-500" />
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-white font-syne font-bold text-3xl shadow-lg border-4 border-surface mt-2">
            {getInitials(user.name)}
          </div>
          
          <h2 className="font-syne font-bold text-xl text-text-primary mt-4">{user.name}</h2>
          <p className="font-dm text-xs text-text-secondary flex items-center justify-center gap-1.5 mt-1.5">
            <Mail size={12} />
            {user.email}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-border">
            <div className="bg-surface-2 rounded-2xl p-3 text-left">
              <p className="font-dm text-[10px] text-text-secondary flex items-center gap-1">
                <MapPin size={10} /> Ciudad
              </p>
              <p className="font-syne font-bold text-xs text-text-primary mt-1">
                {user.city}
              </p>
            </div>
            <div className="bg-surface-2 rounded-2xl p-3 text-left">
              <p className="font-dm text-[10px] text-text-secondary flex items-center gap-1">
                <Calendar size={10} /> Registro
              </p>
              <p className="font-syne font-bold text-xs text-text-primary mt-1">
                {formatRelativeDate(user.createdAt)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Gamification & Levels ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-surface border border-border rounded-3xl p-6 shadow-card space-y-5"
        >
          <h3 className="font-syne font-bold text-sm text-text-primary flex items-center gap-2">
            <Award className="text-primary" size={18} />
            Nivel y Logros
          </h3>

          {/* Level progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="font-dm text-xs text-text-secondary">Nivel Actual</span>
                <p className="font-syne font-extrabold text-2xl text-primary mt-0.5">Nivel {user.level}</p>
              </div>
              <span className="font-mono text-xs text-text-secondary">
                {user.xp} / {user.xpToNextLevel || 500} XP
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-3 bg-surface-2 border border-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
            <p className="font-dm text-[10px] text-text-secondary">
              ¡Gana XP registrando transacciones diarias y cumpliendo tus metas de ahorro!
            </p>
          </div>

          {/* Streaks & Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            {/* Saving Streak */}
            <div className="flex items-center gap-3 bg-orange-50/30 border border-orange-100/50 rounded-2xl p-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame size={20} className="fill-orange-500 animate-pulse" />
              </div>
              <div>
                <p className="font-dm text-[10px] text-orange-600/85 font-semibold">Racha actual</p>
                <p className="font-mono font-bold text-lg text-orange-700">{user.streakDays} días</p>
              </div>
            </div>

            {/* Max Streak */}
            <div className="flex items-center gap-3 bg-purple-50/30 border border-purple-100/50 rounded-2xl p-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-dm text-[10px] text-purple-600/85 font-semibold">Racha máxima</p>
                <p className="font-mono font-bold text-lg text-purple-700">{user.maxStreak || user.streakDays} días</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Actions ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full border-red-200 hover:bg-red-50 text-red-600 font-syne font-bold flex items-center justify-center gap-2 py-3.5 rounded-2xl"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
