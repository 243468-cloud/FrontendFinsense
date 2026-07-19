'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 ArrowLeft, 
 Bell, 
 BellOff, 
 Check, 
 Trash2, 
 AlertTriangle, 
 Flame, 
 Target, 
 Calendar,
 Sparkles,
 Users
} from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';
import { 
 getNotifications, 
 markAsRead, 
 markAllAsRead, 
 deleteNotification, 
 AppNotification 
} from '@/services/notificationService';
import { formatRelativeDate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export default function NotificationsPage() {
 const router = useRouter();
 const { addToast } = useUIStore();
 const { user } = useAuthStore();

 const [notifications, setNotifications] = useState<AppNotification[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 async function loadNotifications() {
 setIsLoading(true);
 try {
 const data = await getNotifications();
 setNotifications(data);
 } catch {
 addToast({ message: 'Error al cargar notificaciones', type: 'error' });
 } finally {
 setIsLoading(false);
 }
 }
 loadNotifications();
 }, [addToast]);

 async function handleMarkAsRead(id: string) {
 try {
 const updated = await markAsRead(id);
 setNotifications(updated);
 } catch {
 addToast({ message: 'Error al actualizar notificación', type: 'error' });
 }
 }

 async function handleMarkAllAsRead() {
 try {
 const updated = await markAllAsRead();
 setNotifications(updated);
 addToast({ message: 'Todas las notificaciones marcadas como leídas', type: 'success' });
 } catch {
 addToast({ message: 'Error al actualizar notificaciones', type: 'error' });
 }
 }

 async function handleDeleteNotification(e: React.MouseEvent, id: string) {
 e.stopPropagation(); // Avoid triggering click to mark as read
 try {
 const updated = await deleteNotification(id);
 setNotifications(updated);
 addToast({ message: 'Notificación eliminada', type: 'success' });
 } catch {
 addToast({ message: 'Error al eliminar notificación', type: 'error' });
 }
 }

 async function handleAcceptInvite(e: React.MouseEvent, notif: AppNotification) {
 e.stopPropagation();
 try {
  // Backend stores invite data in 'message' field (JSON string)
  const inviteData = JSON.parse(notif.message);
  if (inviteData && inviteData.groupId && user?.id) {
  // Send real userId — 'me' is not a valid userId in the backend
  await apiClient.post(`/groups/${inviteData.groupId}/members`, { userId: user.id });
  const updated = await deleteNotification(notif.id);
  setNotifications(updated);
  addToast({ message: `¡Te has unido a ${inviteData.groupName}!`, type: 'success' });
  }
 } catch (error) {
  addToast({ message: 'Error al aceptar invitación', type: 'error' });
 }
 }

 // Get vector icon for notification type
 function getNotificationIcon(type: AppNotification['type']) {
 switch (type) {
 case 'budget':
 return {
 icon: AlertTriangle,
 color: 'text-red-500',
 bg: 'bg-red-500/10 border-red-500/20',
 };
 case 'streak':
 return {
 icon: Flame,
 color: 'text-orange-500',
 bg: 'bg-orange-500/10 border-orange-500/20',
 };
 case 'system':
 return {
 icon: Target,
 color: 'text-primary',
 bg: 'bg-primary/10 border-primary/20',
 };
 case 'group_invite':
 return {
 icon: Users,
 color: 'text-accent',
 bg: 'bg-accent/10 border-accent/20',
 };
 case 'reminder':
 default:
 return {
 icon: Calendar,
 color: 'text-text-secondary',
 bg: 'bg-surface-3 border-border',
 };
 }
 }

 const unreadCount = notifications.filter(n => !n.read).length;

 return (
 <PageTransition className="min-h-screen bg-surface-2">
 {/* ─── Header ─── */}
 <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <button
 onClick={() => router.push('/dashboard')}
 className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
 aria-label="Volver al Dashboard"
 >
 <ArrowLeft size={22} className="text-text-primary" />
 </button>
 <div>
 <h1 className="font-syne font-bold text-lg text-text-primary">Notificaciones</h1>
 <p className="font-dm text-xs text-text-secondary">
 {unreadCount > 0 ? `${unreadCount} pendientes` : 'Al día'}
 </p>
 </div>
 </div>

 {notifications.length > 0 && unreadCount > 0 && (
 <button
 onClick={handleMarkAllAsRead}
 className="text-xs font-dm font-semibold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 touch-target"
 >
 Marcar todo leído
 </button>
 )}
 </header>

 <div className="p-4 max-w-sm sm:max-w-md md:max-w-2xl mx-auto space-y-4 pb-24">
 {isLoading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-20 shimmer-bg rounded-2xl border border-border" />
 ))}
 </div>
 ) : notifications.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center justify-center py-20 text-center space-y-4"
 >
 <div className="w-16 h-16 bg-surface-3 rounded-full flex items-center justify-center text-text-secondary">
 <BellOff size={28} />
 </div>
 <div>
 <h3 className="font-syne font-bold text-base text-text-primary">Bandeja vacía</h3>
 <p className="font-dm text-xs text-text-secondary mt-1">
 No tienes notificaciones de presupuesto o recordatorios por ahora.
 </p>
 </div>
 </motion.div>
 ) : (
 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className="space-y-2.5"
 layout
 >
 <AnimatePresence mode="popLayout">
 {notifications.map((notif) => {
 const style = getNotificationIcon(notif.type);
 const IconComponent = style.icon;

 return (
 <motion.div
 key={notif.id}
 variants={itemVariants}
 layout
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, x: -100 }}
 onClick={() => !notif.read && handleMarkAsRead(notif.id)}
 className={`p-4 rounded-2xl border transition-all flex gap-3 relative overflow-hidden group cursor-pointer ${
 notif.read 
 ? 'bg-surface border-border/60 opacity-80' 
 : 'bg-surface border-primary/20 shadow-blue-sm'
 }`}
 >
 {/* Mark as unread left line indicator */}
 {!notif.read && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" aria-hidden="true" />
 )}

 {/* Icon wrapper */}
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${style.bg} ${style.color}`}>
 <IconComponent size={20} />
 </div>

 {/* Message Details */}
 <div className="flex-1 min-w-0 pr-6">
 <div className="flex items-center gap-1.5">
 <h4 className={`font-syne text-xs sm:text-sm leading-snug truncate ${
 notif.read ? 'font-medium text-text-primary/80' : 'font-bold text-text-primary'
 }`}>
 {notif.title}
 </h4>
 {!notif.read && (
 <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
 )}
 </div>
 
 {notif.type === 'group_invite' ? (
 <div className="mt-1">
 <p className="font-dm text-[11px] sm:text-xs text-text-secondary leading-relaxed">
 {(() => {
 try {
 const data = JSON.parse(notif.message);
 return <><strong className="text-text-primary">{data.senderName}</strong> te ha invitado a unirte al grupo <strong className="text-text-primary">"{data.groupName}"</strong></>;
 } catch {
 return notif.message;
 }
 })()}
 </p>
 <div className="flex items-center gap-2 mt-2">
 <Button size="sm" onClick={(e) => handleAcceptInvite(e, notif)} className="h-7 text-xs font-dm from-accent to-accent-dark">
 Aceptar
 </Button>
 <Button size="sm" variant="outline" onClick={(e) => handleDeleteNotification(e, notif.id)} className="h-7 text-xs font-dm text-text-secondary">
 Rechazar
 </Button>
 </div>
 </div>
 ) : (
 <p className="font-dm text-[11px] sm:text-xs text-text-secondary mt-0.5 leading-relaxed">
 {notif.message}
 </p>
 )}

 <span className="font-mono text-[9px] text-text-secondary mt-1.5 block">
 {formatRelativeDate(notif.date)}
 </span>
 </div>

 {/* Delete action button */}
 {notif.type !== 'group_invite' && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
 <button
 onClick={(e) => handleDeleteNotification(e, notif.id)}
 className="w-8 h-8 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors touch-target"
 aria-label="Eliminar notificación"
 >
 <Trash2 size={16} />
 </button>
 </div>
 )}
 </motion.div>
 );
 })}
 </AnimatePresence>
 </motion.div>
 )}
 </div>
 </PageTransition>
 );
}
