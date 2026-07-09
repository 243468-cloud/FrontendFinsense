'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 ArrowLeft, 
 Target, 
 Calendar, 
 TrendingUp, 
 Hourglass,
 Edit3,
 Trash2,
 Plus,
 Coins,
 CheckCircle2,
 CalendarCheck,
 ChevronRight,
 TrendingDown,
 Sparkles
} from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getGoal, updateGoal, updateProgress, deleteGoal } from '@/services/goalService';
import { formatCurrency, formatDate, getIconForEmoji, getTodayISO } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Goal } from '@/types/goal.types';

interface GoalDetailPageProps {
 params: {
 id: string;
 };
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
 const { id: goalId } = params;
 const router = useRouter();
 const { addToast } = useUIStore();

 const [goal, setGoal] = useState<Goal | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 // Deposit/Abono state
 const [depositAmount, setDepositAmount] = useState('');
 const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

 // Edit form states
 const [showEditPanel, setShowEditPanel] = useState(false);
 const [editTitle, setEditTitle] = useState('');
 const [editTarget, setEditTarget] = useState('');
 const [editDeadline, setEditDeadline] = useState('');
 const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

 useEffect(() => {
 async function loadGoalData() {
 setIsLoading(true);
 try {
 const data = await getGoal(goalId);
 setGoal(data);
 // Pre-fill edit inputs
 setEditTitle(data.title);
 setEditTarget(String(data.targetAmount));
 setEditDeadline(data.deadline.split('T')[0]);
 } catch {
 addToast({ message: 'Error al cargar detalles de la meta', type: 'error' });
 router.push('/goals');
 } finally {
 setIsLoading(false);
 }
 }
 loadGoalData();
 }, [goalId, addToast, router]);

 async function handleAddDeposit(e: React.FormEvent) {
 e.preventDefault();
 if (!goal) return;

 const amount = parseFloat(depositAmount);
 if (!amount || amount <= 0) {
 addToast({ message: 'Ingresa un monto válido', type: 'warning' });
 return;
 }

 setIsSubmittingDeposit(true);
 try {
 const updatedGoal = await updateProgress(goalId, amount);
 setGoal(updatedGoal);
 setDepositAmount('');
 addToast({ message: `¡Abono de ${formatCurrency(amount)} registrado! 💰 +50 XP`, type: 'success' });
 } catch {
 addToast({ message: 'Error al registrar abono', type: 'error' });
 } finally {
 setIsSubmittingDeposit(false);
 }
 }

 async function handleUpdateGoal(e: React.FormEvent) {
 e.preventDefault();
 if (!goal) return;

 const targetAmount = parseFloat(editTarget);
 if (!editTitle.trim()) {
 addToast({ message: 'El título no puede estar vacío', type: 'warning' });
 return;
 }
 if (!targetAmount || targetAmount <= 0) {
 addToast({ message: 'El monto objetivo debe ser mayor a 0', type: 'warning' });
 return;
 }
 if (!editDeadline) {
 addToast({ message: 'Por favor selecciona una fecha límite', type: 'warning' });
 return;
 }

 if (editDeadline < getTodayISO()) {
 addToast({ message: 'La fecha límite no puede ser en el pasado', type: 'error' });
 return;
 }

 setIsUpdatingGoal(true);
 try {
 const updated = await updateGoal(goalId, {
 title: editTitle,
 targetAmount,
 deadline: new Date(editDeadline).toISOString(),
 });
 setGoal(updated);
 setShowEditPanel(false);
 addToast({ message: 'Propiedades de la meta actualizadas', type: 'success' });
 } catch {
 addToast({ message: 'Error al actualizar meta', type: 'error' });
 } finally {
 setIsUpdatingGoal(false);
 }
 }

 async function handleDelete() {
 if (!confirm('¿Estás seguro de que quieres eliminar esta meta de ahorro?')) return;
 try {
 await deleteGoal(goalId);
 addToast({ message: 'Meta eliminada', type: 'success' });
 router.push('/goals');
 } catch {
 addToast({ message: 'Error al eliminar meta', type: 'error' });
 }
 }

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-surface-2">
 <div className="text-center space-y-2">
 <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
 <p className="font-dm text-xs text-text-secondary">Cargando meta...</p>
 </div>
 </div>
 );
 }

 if (!goal) return null;

 const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
 const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
 const isComplete = goal.currentAmount >= goal.targetAmount;
 const GoalIcon = getIconForEmoji(goal.emoji);

 // ─── Proyección de Ahorro Inteligente ───
 // Calculate average daily savings rate based on creation date to today
 const createdDate = new Date(goal.createdAt).getTime();
 const todayDate = new Date().getTime();
 const diffDays = Math.max(Math.round((todayDate - createdDate) / (1000 * 60 * 60 * 24)), 1); // Minimum 1 day to avoid infinity
 const avgSavingsPerDay = goal.currentAmount / diffDays;
 const avgSavingsPerMonth = avgSavingsPerDay * 30.4; // Average month length
 const projectedDaysLeft = avgSavingsPerDay > 0 ? Math.round(remaining / avgSavingsPerDay) : null;
 
 // Date of projected completion
 const projectedCompletionDate = projectedDaysLeft 
 ? new Date(Date.now() + projectedDaysLeft * 24 * 60 * 60 * 1000)
 : null;

 return (
 <PageTransition className="min-h-screen bg-surface-2 pb-24">
 {/* ─── Header ─── */}
 <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <button
 onClick={() => router.push('/goals')}
 className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
 aria-label="Volver a Metas"
 >
 <ArrowLeft size={22} className="text-text-primary" />
 </button>
 <div className="flex items-center gap-2">
 <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
 <GoalIcon size={18} className="text-primary" />
 </div>
 <div>
 <h1 className="font-syne font-bold text-sm sm:text-base text-text-primary leading-tight">{goal.title}</h1>
 <p className="font-dm text-[10px] text-text-secondary">Meta activa</p>
 </div>
 </div>
 </div>

 <button
 onClick={handleDelete}
 className="text-text-secondary hover:text-red-500 transition-colors p-1"
 aria-label="Eliminar meta de ahorro"
 >
 <Trash2 size={18} />
 </button>
 </header>

 <div className="p-3 sm:p-4 space-y-4 max-w-7xl mx-auto md:px-6 md:py-6">
 
 {/* ─── Progreso Visual & Métricas ─── */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-card space-y-4"
 >
 <div className="flex items-center justify-between">
 <span className="font-syne font-bold text-xs sm:text-sm text-text-secondary">Progreso general</span>
 <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full ${
 isComplete ? 'text-success bg-success/10' : 'text-primary bg-blue-50'
 }`}>
 {pct}%
 </span>
 </div>

 {/* Large circular/bar progress showcase */}
 <div className="space-y-2">
 <ProgressBar
 value={goal.currentAmount}
 max={goal.targetAmount}
 color={isComplete ? '#00C896' : '#0057FF'}
 height="md"
 />
 <div className="flex justify-between items-center text-xs font-dm pt-1">
 <div>
 <p className="text-text-secondary">Ahorrado</p>
 <p className="font-mono font-bold text-sm text-text-primary">{formatCurrency(goal.currentAmount)}</p>
 </div>
 <div className="text-right">
 <p className="text-text-secondary">Objetivo</p>
 <p className="font-mono font-bold text-sm text-primary">{formatCurrency(goal.targetAmount)}</p>
 </div>
 </div>
 </div>

 {/* Goal timeline indicator */}
 <div className="flex justify-between items-center pt-2 border-t border-border text-xs font-dm text-text-secondary">
 <span className="flex items-center gap-1">
 <Calendar size={14} />
 Límite: {formatDate(goal.deadline)}
 </span>
 <span>
 {isComplete ? '¡Completada!' : `Faltan: ${formatCurrency(remaining)}`}
 </span>
 </div>
 </motion.div>

 {/* ─── Proyección de Ahorro Inteligente ─── */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4 shadow-card space-y-3 relative overflow-hidden"
 >
 <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
 
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
 <Sparkles size={20} className="text-primary" />
 </div>
 <div className="space-y-1">
 <h2 className="font-syne font-bold text-xs sm:text-sm text-primary">Proyección de Ahorro</h2>
 
 {avgSavingsPerDay <= 0 ? (
 <p className="font-dm text-xs text-text-secondary leading-relaxed pt-0.5">
 Aún no has registrado abonos para esta meta. ¡Realiza tu primer abono a continuación para comenzar a calcular tu ritmo de ahorro proyectado!
 </p>
 ) : (
 <div className="space-y-2 pt-0.5">
 <p className="font-dm text-xs text-text-primary leading-relaxed">
 Tu ritmo promedio actual de ahorro es de <span className="font-bold text-primary font-mono">{formatCurrency(avgSavingsPerMonth)}/mes</span>.
 </p>
 
 {!isComplete && projectedCompletionDate ? (
 <div className="bg-surface/80 p-2.5 rounded-xl border border-primary/10 text-xs font-dm space-y-1">
 <p className="text-text-primary">
 Completarás esta meta en <span className="font-bold text-primary font-mono">{projectedDaysLeft} días</span>.
 </p>
 <p className="text-[10px] text-text-secondary">
 Fecha estimada: <span className="font-bold text-text-primary">{projectedCompletionDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
 </p>
 </div>
 ) : (
 <div className="bg-success/10 p-2.5 rounded-xl border border-success/20 text-xs font-dm text-success flex items-center gap-1.5">
 <CheckCircle2 size={14} className="text-success" />
 <span>¡Felicidades! Has completado tu objetivo de ahorro.</span>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </motion.div>

 {/* ─── Añadir Progreso:"Abonar a la Meta" ─── */}
 {!isComplete && (
 <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
 <h3 className="font-syne font-bold text-xs sm:text-sm text-text-primary mb-3 flex items-center gap-1.5">
 <Coins size={16} className="text-primary" />
 Abonar a tu meta
 </h3>
 <form onSubmit={handleAddDeposit} className="flex gap-2">
 <div className="flex-1 relative">
 <input
 type="number"
 placeholder="Monto a abonar..."
 value={depositAmount}
 onChange={(e) => setDepositAmount(e.target.value)}
 disabled={isSubmittingDeposit}
 className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 font-dm text-xs sm:text-sm text-text-primary outline-none focus:bg-surface focus:border-primary transition-all"
 required
 />
 </div>
 <Button
 type="submit"
 size="sm"
 loading={isSubmittingDeposit}
 icon={<Plus size={14} />}
 className="font-syne font-bold text-xs"
 >
 Abonar
 </Button>
 </form>
 </div>
 )}

 {/* ─── Edición de la Meta de Ahorro ─── */}
 <div className="space-y-2">
 <div className="flex justify-between items-center px-1">
 <h2 className="font-syne font-bold text-sm text-text-primary">Ajustes de meta</h2>
 <button
 onClick={() => setShowEditPanel(!showEditPanel)}
 className="text-xs font-dm font-bold text-primary flex items-center gap-1 hover:underline touch-target"
 >
 {showEditPanel ? 'Cerrar ajustes' : 'Editar meta'}
 <Edit3 size={12} />
 </button>
 </div>

 <AnimatePresence>
 {showEditPanel && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="bg-surface border border-border rounded-2xl p-4 shadow-card space-y-4 overflow-hidden"
 >
 <h3 className="font-syne font-bold text-xs sm:text-sm text-text-primary">Actualizar datos de meta</h3>
 <form onSubmit={handleUpdateGoal} className="space-y-3">
 <Input
 label="Título de la meta"
 type="text"
 value={editTitle}
 onChange={(e) => setEditTitle(e.target.value)}
 icon={<Target size={16} />}
 required
 />

 <Input
 label="Monto objetivo ($)"
 type="number"
 value={editTarget}
 onChange={(e) => setEditTarget(e.target.value)}
 icon={<Coins size={16} />}
 required
 />

 <div className="space-y-1">
 <label htmlFor="deadline" className="font-dm text-xs text-text-secondary pl-1">Fecha límite</label>
 <input
 id="deadline"
 type="date"
 value={editDeadline}
 onChange={(e) => setEditDeadline(e.target.value)}
 min={getTodayISO()}
 className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 font-dm text-xs sm:text-sm text-text-primary outline-none focus:bg-surface focus:border-primary transition-all"
 required
 />
 </div>

 <Button
 type="submit"
 fullWidth
 loading={isUpdatingGoal}
 className="font-syne font-bold text-xs"
 >
 Guardar Cambios
 </Button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </PageTransition>
 );
}
