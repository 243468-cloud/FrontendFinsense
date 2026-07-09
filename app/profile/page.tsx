'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, MapPin, Moon, Sun, LogOut, 
  Tag, Lock, Palette, Briefcase, Calendar, DollarSign,
  Bell, EyeOff, Download, Trash2, ChevronRight, Check, Sparkles
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import SpendingHeatmap from '@/components/analytics/SpendingHeatmap';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getInitials, cn, getTodayISO } from '@/lib/utils';
import { ExportModal } from '@/components/ui/ExportModal';

const CHIAPAS_CITIES = ['Tuxtla Gutiérrez', 'Suchiapa', 'San Cristóbal', 'Comitán', 'Tapachula'];

const ANIMAL_AVATARS = [
  '🦁', '🐯', '🐼', '🐨', '🦊', '🐻', '🐰', '🐹', '🐶', '🐱',
  '🐷', '🐮', '🐸', '🐵', '🐔', '🐧', '🦉', '🦆', '🦖', '🐙',
  '🐝', '🐢', '🐬', '🦦'
];

const COLOR_TEMPLATES = [
  { id: 'blue', name: 'Azul', color: '#0A1128' },
  { id: 'green', name: 'Esmeralda', color: '#064E3B' },
  { id: 'purple', name: 'Morado', color: '#4C1D95' },
  { id: 'rose', name: 'Carmín', color: '#831843' },
  { id: 'slate', name: 'Carbón', color: '#1E293B' },
];

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'preferences', label: 'Apariencia', icon: Palette },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Privacidad', icon: Lock },
];

export default function ProfilePage() {
  const router = useRouter();
  const { addToast, setHasSeenTour, setTourStepIndex } = useUIStore();
  const { 
    user, 
    preferences, 
    updateUserProfile, 
    updateUserPreferences, 
    logout 
  } = useAuthStore();

  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user, router]);

  const [activeTab, setActiveTab] = useState('personal');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Form states
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profileCity, setProfileCity] = useState(user?.city ?? 'Tuxtla Gutiérrez');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar ?? '🦁');
  const [profileOccupation, setProfileOccupation] = useState(user?.occupation ?? '');
  const [profileIncome, setProfileIncome] = useState(user?.monthlyIncome?.toString() ?? '');
  const [profileBirth, setProfileBirth] = useState(user?.birthDate ?? '');
  const [newTag, setNewTag] = useState('');

  // Notifications state (local until saved)
  const [notiBudgets, setNotiBudgets] = useState(preferences?.notifications?.budgets ?? true);
  const [notiSubs, setNotiSubs] = useState(preferences?.notifications?.subscriptions ?? true);
  const [notiGame, setNotiGame] = useState(preferences?.notifications?.gamification ?? true);

  // Privacy state
  const [hideBalances, setHideBalances] = useState(preferences?.privacy?.hideBalances ?? false);

  const toggleDarkMode = () => {
    const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updateUserPreferences({ theme: nextTheme });
    addToast({ message: `Modo ${nextTheme === 'dark' ? 'oscuro' : 'claro'} activado`, type: 'success' });
  };

  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      addToast({ message: 'Nombre y correo son obligatorios', type: 'warning' });
      return;
    }
    updateUserProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      city: profileCity,
      avatar: profileAvatar,
      occupation: profileOccupation.trim(),
      monthlyIncome: profileIncome ? parseFloat(profileIncome) : undefined,
      birthDate: profileBirth
    });
    
    updateUserPreferences({
      notifications: { budgets: notiBudgets, subscriptions: notiSubs, gamification: notiGame },
      privacy: { hideBalances }
    });

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
    updateUserPreferences({ customTags: [...preferences.customTags, tag] });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateUserPreferences({ customTags: preferences.customTags.filter(t => t !== tagToRemove) });
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      router.push('/auth');
    }
  };

  const handleExportData = () => {
    setIsExportModalOpen(true);
  };

  const handleDeleteAccount = () => {
    if (confirm('Esta acción es IRREVERSIBLE. ¿Estás absolutamente seguro de eliminar tu cuenta y todos tus datos?')) {
      addToast({ message: 'Solicitud de eliminación enviada', type: 'warning' });
      setTimeout(() => { logout(); router.push('/auth'); }, 1000);
    }
  };

  if (!user) return null;

  return (
    <PageTransition className="min-h-screen bg-surface-2 transition-colors duration-200 pb-20 text-text-primary">
      {/* Header Expandido */}
      <div className="bg-surface border-b border-border shadow-sm">
        <header className="px-4 py-3.5 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-surface-2 transition-colors">
              <ArrowLeft size={22} className="text-text-primary" />
            </button>
            <h1 className="font-syne font-bold text-lg">Configuración</h1>
          </div>
          <button onClick={handleSaveProfile} className="bg-primary text-white px-4 py-1.5 rounded-xl font-dm text-sm font-semibold hover:bg-primary/90 transition-colors shadow-blue-sm">
            Guardar
          </button>
        </header>

        {/* Profile Card Summary */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1 flex items-center justify-center text-4xl shadow-card">
                <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
                  {profileAvatar}
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-syne font-bold text-2xl">{profileName}</h2>
              <p className="font-dm text-text-secondary text-sm flex items-center justify-center md:justify-start gap-1">
                <Mail size={14}/> {profileEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
          <SpendingHeatmap />
        </div>

        {/* Tabs Nav */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex overflow-x-auto no-scrollbar gap-2 pb-px mt-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-dm font-semibold border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* ─── TAB: PERSONAL ─── */}
            {activeTab === 'personal' && (
              <>
                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><User size={18} className="text-primary"/> Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Nombre Completo</label>
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Correo Electrónico</label>
                      <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Ciudad</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3 text-text-secondary" />
                        <select value={profileCity} onChange={e => setProfileCity(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2.5 font-dm text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20">
                          {CHIAPAS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Fecha de Nacimiento</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-3 text-text-secondary" />
                        <input type="date" value={profileBirth} onChange={e => setProfileBirth(e.target.value)} max={getTodayISO()} className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2.5 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={18} className="text-primary"/> Perfil Financiero (Opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Ocupación</label>
                      <select value={profileOccupation} onChange={e => setProfileOccupation(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Seleccionar...</option>
                        <option value="Estudiante">Estudiante</option>
                        <option value="Empleado">Empleado</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Negocio Propio">Negocio Propio</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-dm font-bold text-text-secondary uppercase">Ingreso Mensual Estimado</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3.5 top-3 text-text-secondary" />
                        <input type="number" placeholder="0.00" value={profileIncome} onChange={e => setProfileIncome(e.target.value)} className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2.5 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-dm text-text-secondary mt-3">Estos datos ayudan a nuestro asesor IA a brindarte mejores recomendaciones.</p>
                </div>
              </>
            )}

            {/* ─── TAB: PREFERENCES ─── */}
            {activeTab === 'preferences' && (
              <>
                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Palette size={18} className="text-primary"/> Apariencia</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border mb-4">
                    <div>
                      <h4 className="font-dm font-bold text-sm">Modo Oscuro</h4>
                      <p className="text-xs text-text-secondary">Reduce el brillo de tu pantalla</p>
                    </div>
                    <button onClick={toggleDarkMode} className="p-3 bg-surface rounded-xl shadow-sm border border-border text-text-primary hover:bg-surface-3 transition-colors">
                      {preferences.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                  </div>

                  <h4 className="font-dm font-bold text-sm mb-2 mt-6">Color Principal (Requiere recargar)</h4>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => updateUserPreferences({ themeColor: t.color })} className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        preferences.themeColor === t.color ? "border-primary scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                      )} style={{ backgroundColor: t.color }} title={t.name} aria-label={t.name}/>
                    ))}
                  </div>

                  <h4 className="font-dm font-bold text-sm mb-2 mt-6">Tu Avatar</h4>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {ANIMAL_AVATARS.map(animal => (
                      <button key={animal} onClick={() => setProfileAvatar(animal)} className={cn(
                        "text-2xl p-2 rounded-xl transition-all",
                        profileAvatar === animal ? "bg-primary/20 scale-110 shadow-inner" : "hover:bg-surface-2 hover:scale-110 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                      )}>
                        {animal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Tag size={18} className="text-primary"/> Etiquetas Personalizadas</h3>
                  <p className="text-xs font-dm text-text-secondary mb-4">Usa etiquetas rápidas para categorizar tus transacciones fácilmente.</p>
                  <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                    <input type="text" placeholder="Ej. uber, netflix, oxxo" value={newTag} onChange={e => setNewTag(e.target.value)} className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl font-bold font-dm text-sm hover:bg-primary/90 transition-colors">Agregar</button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {preferences.customTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-surface-2 border border-border px-3 py-1.5 rounded-lg text-xs font-dm text-text-primary">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-text-secondary hover:text-red-500"><ChevronRight size={14} className="rotate-45"/></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border mt-6">
                  <h3 className="font-syne font-bold text-lg mb-2 flex items-center gap-2"><Sparkles size={18} className="text-primary"/> Guía de FinSense</h3>
                  <p className="text-xs font-dm text-text-secondary mb-4">¿Te perdiste de algo o quieres volver a ver el tutorial interactivo (con el perrito)?</p>
                  <button 
                    onClick={() => {
                      setHasSeenTour(false);
                      setTourStepIndex(0);
                      router.push('/dashboard');
                    }} 
                    className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl font-bold font-dm text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    Reiniciar Guía de Bienvenida
                  </button>
                </div>
              </>
            )}

            {/* ─── TAB: NOTIFICATIONS ─── */}
            {activeTab === 'notifications' && (
              <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Bell size={18} className="text-primary"/> Preferencias de Notificaciones</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border cursor-pointer hover:bg-surface-3 transition-colors">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-text-primary">Alertas de Presupuestos</h4>
                      <p className="text-xs text-text-secondary mt-1">Avisarme cuando alcance el 80% o 100% de mi presupuesto.</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", notiBudgets ? "bg-primary" : "bg-border")}>
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", notiBudgets ? "translate-x-6" : "")} />
                    </div>
                    <input type="checkbox" className="hidden" checked={notiBudgets} onChange={() => setNotiBudgets(!notiBudgets)} />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border cursor-pointer hover:bg-surface-3 transition-colors">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-text-primary">Recordatorios de Suscripciones</h4>
                      <p className="text-xs text-text-secondary mt-1">Notificarme 3 días antes de que se cobre una suscripción activa.</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", notiSubs ? "bg-primary" : "bg-border")}>
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", notiSubs ? "translate-x-6" : "")} />
                    </div>
                    <input type="checkbox" className="hidden" checked={notiSubs} onChange={() => setNotiSubs(!notiSubs)} />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border cursor-pointer hover:bg-surface-3 transition-colors">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-text-primary">Novedades y Gamificación</h4>
                      <p className="text-xs text-text-secondary mt-1">Recibir recordatorios de rachas e insignias obtenidas.</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", notiGame ? "bg-primary" : "bg-border")}>
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", notiGame ? "translate-x-6" : "")} />
                    </div>
                    <input type="checkbox" className="hidden" checked={notiGame} onChange={() => setNotiGame(!notiGame)} />
                  </label>
                </div>
              </div>
            )}

            {/* ─── TAB: SECURITY (Danger Zone) ─── */}
            {activeTab === 'security' && (
              <>
                <div className="bg-surface p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2"><Lock size={18} className="text-primary"/> Privacidad</h3>
                  <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border cursor-pointer hover:bg-surface-3 transition-colors">
                    <div className="flex items-start gap-3">
                      <EyeOff size={20} className="text-text-secondary mt-0.5"/>
                      <div>
                        <h4 className="font-dm font-bold text-sm text-text-primary">Modo Discreto (Ocultar Saldos)</h4>
                        <p className="text-xs text-text-secondary mt-1">Oculta tus saldos con asteriscos (***) por defecto al abrir la app.</p>
                      </div>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", hideBalances ? "bg-primary" : "bg-border")}>
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", hideBalances ? "translate-x-6" : "")} />
                    </div>
                    <input type="checkbox" className="hidden" checked={hideBalances} onChange={() => setHideBalances(!hideBalances)} />
                  </label>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-5 sm:p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 mt-8">
                  <h3 className="font-syne font-bold text-lg mb-4 text-red-600 dark:text-red-500">Zona de Peligro</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-surface rounded-xl border border-red-100 dark:border-red-900/30 mb-4">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-text-primary">Exportar mis Datos</h4>
                      <p className="text-xs text-text-secondary mt-1">Descarga un archivo con toda tu información transaccional y personal.</p>
                    </div>
                    <button onClick={handleExportData} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-surface-2 border border-border rounded-lg text-sm font-dm font-bold hover:bg-surface-3 transition-colors">
                      <Download size={16} /> Exportar JSON
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-surface rounded-xl border border-red-100 dark:border-red-900/30">
                    <div>
                      <h4 className="font-dm font-bold text-sm text-text-primary">Eliminar Cuenta</h4>
                      <p className="text-xs text-text-secondary mt-1">Elimina permanentemente tu cuenta y todos tus datos.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-dm font-bold hover:bg-red-200 transition-colors">
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-8 flex justify-center">
                  <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-dm font-bold">
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </PageTransition>
  );
}
