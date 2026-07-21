'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
 ArrowLeft, User, Lock, MapPin, Bell,
 Shield, LogOut, Trash2, ChevronRight, Palette, Check, FileText, X
} from 'lucide-react';
import { PageTransition, itemVariants } from '@/components/layout/PageTransition';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';

const CITIES = ['Tuxtla Gutiérrez', 'Suchiapa'];
const COLORS = [
 { id: 'blue',   label: 'Azul',    hex: '#0A1128' },
 { id: 'ocean',  label: 'Océano',  hex: '#0C2340' },
 { id: 'purple', label: 'Morado',  hex: '#4C1D95' },
 { id: 'rose',   label: 'Carmín',  hex: '#831843' },
 { id: 'slate',  label: 'Carbón',  hex: '#1E293B' },
];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
 return (
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden"
 >
 <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
 <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
 <Icon size={15} className="text-primary" />
 </div>
 <h2 className="font-syne font-bold text-sm text-text-primary">{title}</h2>
 </div>
 <div className="divide-y divide-border">{children}</div>
 </motion.div>
 );
}

function SettingRow({ label, sub, onClick, right, danger }: {
 label: string; sub?: string; onClick?: () => void; right?: React.ReactNode; danger?: boolean;
}) {
 return (
 <button
 onClick={onClick}
 className={cn(
 'w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors',
 danger ? 'hover:bg-red-50/60' : 'hover:bg-surface-2/70'
 )}
 >
 <div>
 <p className={cn('font-dm text-sm font-medium', danger ? 'text-error' : 'text-text-primary')}>{label}</p>
 {sub && <p className="font-dm text-xs text-text-secondary mt-0.5">{sub}</p>}
 </div>
 {right ?? <ChevronRight size={16} className="text-text-secondary/50 flex-shrink-0" />}
 </button>
 );
}

export default function SettingsPage() {
 const router = useRouter();
 const { addToast } = useUIStore();
 const { user, preferences, updateUserProfile, updateUserPreferences, logout } = useAuthStore();

 const [name, setName] = useState(user?.name ?? '');
 const [city, setCity] = useState(user?.city ?? 'Tuxtla Gutiérrez');
 const [editingProfile, setEditingProfile] = useState(false);
 const [notifications, setNotifications] = useState(true);
 const [showPrivacy, setShowPrivacy] = useState(false);

 useEffect(() => { if (!user) router.push('/auth'); }, [user, router]);

 useEffect(() => {
 if (preferences.theme === 'dark') document.documentElement.classList.add('dark');
 else document.documentElement.classList.remove('dark');
 }, [preferences.theme]);

 const toggleTheme = () => {
 const next = preferences.theme === 'dark' ? 'light' : 'dark';
 updateUserPreferences({ theme: next });
 addToast({ message: `Modo ${next === 'dark' ? 'oscuro' : 'claro'} activado`, type: 'success' });
 };

 const saveProfile = async () => {
  if (!name.trim()) { addToast({ message: 'El nombre no puede estar vacío', type: 'warning' }); return; }
  try {
    // Persist to backend so it survives logout/login
    await apiClient.patch('/auth/profile', { name: name.trim(), city });
    updateUserProfile({ name: name.trim(), email: user?.email ?? '', city, avatar: user?.avatar ?? '' });
    setEditingProfile(false);
    addToast({ message: 'Perfil actualizado', type: 'success' });
  } catch {
    addToast({ message: 'Error al guardar el perfil', type: 'error' });
  }
 };

 const handleLogout = () => {
 if (confirm('¿Cerrar sesión?')) { logout(); router.push('/auth'); }
 };

 if (!user) return null;

 return (
 <>
 {/* Privacy Policy Modal */}
 <AnimatePresence>
 {showPrivacy && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
 onClick={e => { if (e.target === e.currentTarget) setShowPrivacy(false); }}
 >
 <motion.div
 initial={{ y: '100%', opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: '100%', opacity: 0 }}
 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
 className="bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
 >
 {/* Modal Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
 <Shield size={16} className="text-primary" />
 </div>
 <div>
 <h3 className="font-syne font-bold text-sm text-text-primary">Aviso de Privacidad</h3>
 <p className="font-dm text-[10px] text-text-secondary">Plataforma FinSense — UPChiapas</p>
 </div>
 </div>
 <button onClick={() => setShowPrivacy(false)} className="p-2 rounded-xl hover:bg-surface-3 transition-colors">
 <X size={18} className="text-text-secondary" />
 </button>
 </div>

 {/* Scrollable Content */}
 <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 text-text-primary">

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">I. Identidad y Domicilio del Responsable</h4>
 <p className="font-dm text-xs text-text-secondary leading-relaxed">
 El equipo de desarrollo del proyecto <strong>FinSense</strong>, integrado por los estudiantes <strong>Marco Antonio Lequin Sánchez</strong>, <strong>Kaled Pacheco Hernández</strong> y <strong>Cristopher Leonardo Vázquez López</strong> de la Ingeniería en Tecnologías de la Información e Innovación Digital de la <strong>Universidad Politécnica de Chiapas</strong>, con domicilio legal en las instalaciones de la propia institución en Chiapas, México, es el responsable del tratamiento, uso, almacenamiento y protección de los datos personales que se recaben de los usuarios.
 </p>
 </section>

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">II. Datos Personales Sometidos a Tratamiento</h4>
 <p className="font-dm text-xs text-text-secondary leading-relaxed">
 Para la correcta operación de la plataforma se solicitará el <strong>nombre completo</strong> y la <strong>dirección de correo electrónico</strong> del usuario, indispensables para el proceso de autenticación segura mediante tokens web JSON (JWT). Asimismo, el sistema procesará los <strong>registros financieros personales</strong> (ingresos, gastos, metas de ahorro) que el propio usuario decida ingresar voluntariamente.
 </p>
 </section>

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">III. Finalidades del Tratamiento</h4>
 <ul className="font-dm text-xs text-text-secondary space-y-1 leading-relaxed list-disc pl-4">
 <li>Autenticación segura y control de acceso mediante JWT.</li>
 <li>Gestión personalizada de economía personal del usuario.</li>
 <li>Generación de estadísticas, reportes y consejos financieros dentro de la plataforma.</li>
 <li>Cumplimiento de los objetivos académicos del proyecto de integración profesional.</li>
 </ul>
 </section>

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">IV. Transferencia de Datos</h4>
 <p className="font-dm text-xs text-text-secondary leading-relaxed">
 Los datos personales <strong>no serán transferidos</strong> a terceros sin el consentimiento previo del titular, salvo en los casos previstos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y demás normativa aplicable.
 </p>
 </section>

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">V. Derechos ARCO</h4>
 <p className="font-dm text-xs text-text-secondary leading-relaxed">
 Tienes derecho de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> sobre tus datos personales. Para ejercerlos, puedes contactar al equipo de desarrollo en:
 </p>
 <div className="mt-2 space-y-0.5">
 {['243468@it2id.upchiapas.edu.mx','243759@ids.upchiapas.edu.mx','251201@ids.upchiapas.edu.mx'].map(mail => (
 <p key={mail} className="font-mono text-[10px] text-primary">{mail}</p>
 ))}
 </div>
 </section>

 <section>
 <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-primary mb-2">VI. Medidas de Seguridad</h4>
 <p className="font-dm text-xs text-text-secondary leading-relaxed">
 Los datos son almacenados en servidores con acceso controlado. Las contraseñas son cifradas con <strong>bcrypt</strong> y las sesiones protegidas mediante <strong>JWT con expiración</strong>. Los datos financieros son de uso estrictamente personal y no están expuestos públicamente.
 </p>
 </section>

 <p className="font-dm text-[10px] text-text-secondary/50 text-center pt-2">
 Última actualización: Julio 2026 · Universidad Politécnica de Chiapas
 </p>
 </div>

 {/* Footer */}
 <div className="px-5 py-4 border-t border-border flex-shrink-0">
 <button
 onClick={() => setShowPrivacy(false)}
 className="w-full py-3 bg-primary text-white rounded-2xl font-dm font-semibold text-sm hover:bg-primary/90 transition-colors"
 >
 Aceptar y Cerrar
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 <PageTransition className="min-h-screen bg-surface-2/50 -2 pb-24 text-text-primary">
 {/* Header */}
 <header className="sticky top-0 z-20 bg-surface/95 /95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center gap-3 shadow-sm">
 <button onClick={() => router.back()} className="touch-target rounded-xl hover:bg-surface-3 dark:hover:bg-surface-3 transition-colors p-2" aria-label="Volver">
 <ArrowLeft size={22} className="text-text-primary" />
 </button>
 <div>
 <h1 className="font-syne font-bold text-lg text-text-primary">Configuración</h1>
 <p className="font-dm text-xs text-text-secondary">Personaliza tu experiencia</p>
 </div>
 </header>

 <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

 {/* ─── Cuenta ─── */}
 <SectionCard title="Cuenta" icon={User}>
 {editingProfile ? (
 <div className="px-5 py-4 space-y-3">
 <div>
 <label className="font-dm text-xs text-text-secondary font-semibold mb-1 block">Nombre</label>
 <input
 value={name}
 onChange={e => setName(e.target.value)}
 className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
 />
 </div>
 <div>
 <label className="font-dm text-xs text-text-secondary font-semibold mb-1 block">Ciudad</label>
 <select
 value={city}
 onChange={e => setCity(e.target.value)}
 className="w-full px-3 py-2 rounded-xl border border-border bg-surface-2 font-dm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
 >
 {CITIES.map(c => <option key={c}>{c}</option>)}
 </select>
 </div>
 <div className="flex gap-2 pt-1">
 <button onClick={saveProfile} className="flex-1 py-2 bg-primary text-white rounded-xl font-dm font-semibold text-sm hover:bg-primary/90 transition-colors">
 Guardar
 </button>
 <button onClick={() => { setEditingProfile(false); setName(user.name); }} className="flex-1 py-2 bg-surface-3 text-text-secondary rounded-xl font-dm font-semibold text-sm hover:bg-slate-200 transition-colors">
 Cancelar
 </button>
 </div>
 </div>
 ) : (
 <>
 <SettingRow
 label={user.name}
 sub={user.email}
 onClick={() => setEditingProfile(true)}
 right={<span className="text-xs font-dm text-primary font-semibold">Editar</span>}
 />
 <SettingRow label="Ciudad" sub={user.city} onClick={() => setEditingProfile(true)} />
 </>
 )}
 </SectionCard>

 {/* ─── Apariencia ─── */}
 <SectionCard title="Apariencia" icon={Palette}>
 <SettingRow
 label="Modo oscuro"
 sub={preferences.theme === 'dark' ? 'Activado' : 'Desactivado'}
 onClick={toggleTheme}
 right={
 <div className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0', preferences.theme === 'dark' ? 'bg-primary' : 'bg-slate-200')}>
 <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-surface shadow transition-all', preferences.theme === 'dark' ? 'left-5' : 'left-1')} />
 </div>
 }
 />
 <div className="px-5 py-4">
 <p className="font-dm text-sm font-medium text-text-primary mb-3">Color del tema</p>
 <div className="flex gap-2.5 flex-wrap">
 {COLORS.map(c => (
 <button
 key={c.id}
 onClick={() => { updateUserPreferences({ themeColor: c.hex }); addToast({ message: `Tema"${c.label}" aplicado`, type: 'success' }); }}
 className="flex flex-col items-center gap-1 group"
 title={c.label}
 >
 <div
 className="w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center"
 style={{ backgroundColor: c.hex, borderColor: preferences.themeColor === c.hex ? '#0057FF' : 'transparent' }}
 >
 {preferences.themeColor === c.hex && <Check size={14} className="text-white" strokeWidth={3} />}
 </div>
 <span className="font-dm text-[10px] text-text-secondary">{c.label}</span>
 </button>
 ))}
 </div>
 </div>
 </SectionCard>

 {/* ─── Notificaciones ─── */}
 <SectionCard title="Notificaciones" icon={Bell}>
 <SettingRow
 label="Notificaciones push"
 sub={notifications ? 'Recibirás alertas de tus metas' : 'Sin notificaciones'}
 onClick={() => { setNotifications(n => !n); addToast({ message: !notifications ? 'Notificaciones activadas' : 'Notificaciones desactivadas', type: 'success' }); }}
 right={
 <div className={cn('w-10 h-6 rounded-full transition-colors relative flex-shrink-0', notifications ? 'bg-primary' : 'bg-slate-200')}>
 <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-surface shadow transition-all', notifications ? 'left-5' : 'left-1')} />
 </div>
 }
 />
 </SectionCard>

 {/* ─── Privacidad ─── */}
 <SectionCard title="Privacidad y Seguridad" icon={Shield}>
 <SettingRow
 label="Aviso de Privacidad"
 sub="Plataforma FinSense — UPChiapas"
 onClick={() => setShowPrivacy(true)}
 right={<FileText size={16} className="text-text-secondary/50" />}
 />
 <SettingRow
 label="Cerrar sesión"
 sub="Salir de tu cuenta en este dispositivo"
 onClick={handleLogout}
 danger
 right={<LogOut size={16} className="text-error" />}
 />
 <SettingRow
 label="Eliminar cuenta"
 sub="Esta acción no se puede deshacer"
 onClick={() => addToast({ message: 'Contacta a soporte para eliminar tu cuenta', type: 'warning' })}
 danger
 right={<Trash2 size={16} className="text-error" />}
 />
 </SectionCard>

 {/* Version */}
 <p className="text-center font-dm text-[11px] text-text-secondary/40 pt-2">
 FinSense v1.0 · Universidad Politécnica de Chiapas
 </p>
 </div>
 </PageTransition>
 </>
 );
}
