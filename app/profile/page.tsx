'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Moon, 
  Sun, 
  Plus, 
  X, 
  LogOut, 
  Award, 
  Flame, 
  Target, 
  Tag
} from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getInitials, cn } from '@/lib/utils';

const CHIAPAS_CITIES = [
  'Tuxtla Gutiérrez',
  'Suchiapa'
];

export default function ProfilePage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { 
    user, 
    preferences, 
    updateUserProfile, 
    updateUserPreferences, 
    logout 
  } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Profile forms state
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profileCity, setProfileCity] = useState(user?.city ?? 'Tuxtla Gutiérrez');

  // Tag manager state
  const [newTag, setNewTag] = useState('');

  // Preference change handler
  const toggleDarkMode = () => {
    const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updateUserPreferences({ theme: nextTheme });
    addToast({ 
      message: `Modo ${nextTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 
      type: 'success' 
    });
  };

  useEffect(() => {
    // Apply class to html
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast({ message: 'El nombre no puede estar vacío', type: 'warning' });
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      addToast({ message: 'Introduce un correo válido', type: 'warning' });
      return;
    }

    updateUserProfile(profileName.trim(), profileEmail.trim(), profileCity);
    addToast({ message: 'Perfil actualizado correctamente', type: 'success' });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (!tag) return;
    if (preferences.customTags.includes(tag)) {
      addToast({ message: 'Esta etiqueta ya existe', type: 'warning' });
      return;
    }
    
    updateUserPreferences({
      customTags: [...preferences.customTags, tag]
    });
    setNewTag('');
    addToast({ message: `Etiqueta "${tag}" agregada`, type: 'success' });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateUserPreferences({
      customTags: preferences.customTags.filter(t => t !== tagToRemove)
    });
    addToast({ message: 'Etiqueta eliminada', type: 'success' });
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      addToast({ message: 'Sesión cerrada', type: 'success' });
      router.push('/auth');
    }
  };

  if (!user) return null;

  return (
    <PageTransition className="min-h-screen bg-slate-50/50 dark:bg-surface-2 transition-colors duration-200 pb-20 text-text-primary">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="touch-target rounded-xl hover:bg-slate-100 dark:hover:bg-surface-3 transition-colors p-2"
            aria-label="Volver al Dashboard"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div>
            <h1 className="font-syne font-bold text-lg text-text-primary">Mi Perfil</h1>
            <p className="font-dm text-xs text-text-secondary">Configuración y cuenta</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-dm font-semibold text-error hover:bg-error/5 dark:hover:bg-error/10 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors touch-target border border-error/10 bg-white dark:bg-surface shadow-sm"
          aria-label="Cerrar sesión"
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
      </header>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto md:px-8 space-y-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── Column Left (Sidebar) ─── */}
          <aside className="lg:col-span-4 bg-white dark:bg-surface border border-border rounded-3xl p-6 shadow-card space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A66FF] to-accent flex items-center justify-center text-white font-syne font-bold text-3xl shadow-blue-sm">
                {getInitials(user.name)}
              </div>
              <div className="space-y-1.5">
                <h2 className="font-syne font-bold text-lg text-text-primary">{user.name}</h2>
                <p className="font-dm text-xs text-text-secondary">{user.email}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-[#1A66FF] font-semibold bg-[#F0F5FF] px-2.5 py-1 rounded-full border border-blue-100 w-fit mx-auto">
                  <MapPin size={12} />
                  <span>{user.city}</span>
                </div>
              </div>
            </div>

            {/* Level status */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-dm text-text-secondary">Nivel actual</span>
                <span className="font-syne font-bold text-[#1A66FF]">Nivel {user.level}</span>
              </div>
              <ProgressBar
                value={user.xp}
                max={user.xpToNextLevel}
                color="#1A66FF"
                height="xs"
              />
              <div className="flex justify-between text-[9px] font-mono text-text-secondary pt-0.5">
                <span>{user.xp} XP</span>
                <span>{user.xpToNextLevel} XP para Lvl {user.level + 1}</span>
              </div>
            </div>

            {/* Dark Mode switcher inside sidebar */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.theme === 'dark' ? (
                    <Moon size={18} className="text-accent" />
                  ) : (
                    <Sun size={18} className="text-warning" />
                  )}
                  <div>
                    <p className="font-syne font-semibold text-xs text-text-primary">Modo oscuro</p>
                    <p className="font-dm text-[10px] text-text-secondary">Fatiga visual reducida</p>
                  </div>
                </div>
                
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    preferences.theme === 'dark' ? 'bg-[#1A66FF]' : 'bg-slate-200 border border-border'
                  }`}
                  role="switch"
                  aria-checked={preferences.theme === 'dark'}
                  aria-label="Alternar modo oscuro"
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      preferences.theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </aside>

          {/* ─── Column Right (Dynamic Content) ─── */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Bloque Superior: Rendimiento/Gamificación */}
            <section className="bg-white dark:bg-surface border border-border rounded-3xl p-6 shadow-card">
              <h3 className="font-syne font-bold text-sm sm:text-base text-text-primary mb-4">Rendimiento y Logros</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#F0F5FF] border border-blue-100/50 p-3.5 rounded-2xl text-center flex flex-col items-center">
                  <div className="text-[#1A66FF] mb-1.5"><Flame size={20} /></div>
                  <p className="font-mono font-bold text-text-primary text-sm sm:text-base">{user.streakDays} días</p>
                  <p className="font-dm text-[10px] sm:text-xs text-text-secondary mt-0.5">Racha actual</p>
                </div>
                <div className="bg-[#F0F5FF] border border-blue-100/50 p-3.5 rounded-2xl text-center flex flex-col items-center">
                  <div className="text-[#1A66FF] mb-1.5"><Target size={20} /></div>
                  <p className="font-mono font-bold text-text-primary text-sm sm:text-base">{user.goalsCompleted}</p>
                  <p className="font-dm text-[10px] sm:text-xs text-text-secondary mt-0.5">Metas logradas</p>
                </div>
                <div className="bg-[#F0F5FF] border border-blue-100/50 p-3.5 rounded-2xl text-center flex flex-col items-center">
                  <div className="text-[#1A66FF] mb-1.5"><Award size={20} /></div>
                  <p className="font-mono font-bold text-text-primary text-sm sm:text-base">{user.maxStreak} días</p>
                  <p className="font-dm text-[10px] sm:text-xs text-text-secondary mt-0.5">Racha récord</p>
                </div>
              </div>
            </section>

            {/* Bloque Medio: Datos Personales Form */}
            <section className="bg-white dark:bg-surface border border-border rounded-3xl p-6 shadow-card">
              <h3 className="font-syne font-bold text-sm sm:text-base text-text-primary mb-4">Datos personales</h3>
              <form onSubmit={handleSaveProfile} className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-syne font-semibold text-xs text-text-primary pl-1">Nombre completo</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white focus:border-[#1A66FF] focus:ring-2 focus:ring-[#1A66FF]/10 transition-all shadow-sm"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-syne font-semibold text-xs text-text-primary pl-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white focus:border-[#1A66FF] focus:ring-2 focus:ring-[#1A66FF]/10 transition-all shadow-sm"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-syne font-semibold text-xs text-text-primary pl-1">Municipio de Chiapas</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <select
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-dm text-sm text-text-primary focus:outline-none focus:bg-white focus:border-[#1A66FF] focus:ring-2 focus:ring-[#1A66FF]/10 transition-all appearance-none shadow-sm cursor-pointer"
                    >
                      {CHIAPAS_CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#1A66FF] hover:bg-[#0047D4] text-white font-dm font-bold text-sm rounded-xl transition-colors shadow-blue-sm self-end"
                >
                  Guardar cambios
                </button>
              </form>
            </section>

            {/* Bloque Inferior: Etiquetas Personalizadas */}
            <section className="bg-white dark:bg-surface border border-border rounded-3xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={18} className="text-[#1A66FF]" />
                <h3 className="font-syne font-bold text-sm sm:text-base text-text-primary">Etiquetas personalizadas</h3>
              </div>
              <p className="font-dm text-xs text-text-secondary mb-4 leading-normal">
                Agrega etiquetas para organizar tus gastos colaborativos y de uso diario de manera más flexible.
              </p>

              {/* List of tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {preferences.customTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-[#F0F5FF] border border-blue-100 text-[#1A66FF] font-dm font-semibold text-xs"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="w-5 h-5 rounded-full hover:bg-[#1A66FF]/10 flex items-center justify-center transition-colors text-[#1A66FF]/70 hover:text-[#1A66FF]"
                      aria-label={`Eliminar etiqueta ${tag}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {preferences.customTags.length === 0 && (
                  <span className="font-dm text-xs text-text-secondary italic">
                    No tienes etiquetas personalizadas aún.
                  </span>
                )}
              </div>

              {/* Form to add tags */}
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nueva etiqueta (ej. cafeteria)..."
                  maxLength={20}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-dm text-xs sm:text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white focus:border-[#1A66FF] transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#1A66FF] hover:bg-[#0047D4] text-white rounded-xl flex items-center justify-center transition-colors shadow-blue-sm touch-target"
                  aria-label="Agregar etiqueta"
                >
                  <Plus size={18} />
                </button>
              </form>
            </section>
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
