'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Users, HelpCircle, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';
import { createGroup } from '@/services/groupService';
import { cn, getInitials, getIconForEmoji } from '@/lib/utils';
import apiClient from '@/lib/apiClient';

const EMOJIS = ['🏠', '✈️', '🍽️', '💼', '🎉', '🤝', '🎮', '❤️', '🎁', '☕'];




// Checkmark animation on save
function SuccessAnimation({ onDone }: { onDone: () => void }) {
 return (
 <motion.div
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <motion.div
 className="w-24 h-24 rounded-full bg-success flex items-center justify-center"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', stiffness: 300, damping: 20 }}
 onAnimationComplete={() => setTimeout(onDone, 800)}
 >
 <motion.div
 initial={{ pathLength: 0, opacity: 0 }}
 animate={{ pathLength: 1, opacity: 1 }}
 transition={{ delay: 0.2, duration: 0.4 }}
 >
 <Check size={48} className="text-white" strokeWidth={3} />
 </motion.div>
 </motion.div>
 </motion.div>
 );
}

export default function NewGroupPage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real users from backend
    apiClient.get('/auth/users').then(res => {
      setAvailableUsers(res.data);
    }).catch(e => console.error('Error fetching users:', e));
  }, []);

 function handleToggleMember(id: string) {
 setSelectedMembers((prev) =>
 prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
 );
 }

 async function handleSave() {
 if (!name.trim()) {
 setNameError('El nombre del grupo es obligatorio');
 addToast({ message: 'El nombre es obligatorio', type: 'warning' });
 return;
 }
 setNameError('');
 setIsLoading(true);

 try {
 await createGroup({
 name,
 emoji: selectedEmoji,
 description: description || undefined,
 memberIds: selectedMembers
 });
 setShowSuccess(true);
 } catch {
 addToast({ message: 'Error al crear el grupo', type: 'error' });
 setIsLoading(false);
 }
 }

 return (
 <div className="min-h-screen bg-surface-2 flex flex-col">
 {/* ─── Header ─── */}
 <header className="flex items-center gap-3 px-4 py-4 bg-surface border-b border-border">
 <button
 onClick={() => router.back()}
 className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
 aria-label="Volver"
 >
 <ArrowLeft size={22} className="text-text-primary" />
 </button>
 <h1 className="font-syne font-bold text-lg text-text-primary flex-1">
 Crear grupo nuevo
 </h1>
 </header>

 <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 space-y-5 pb-10">
 {/* Emoji Selector Card */}
  <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center">
  <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-primary shadow-blue-sm border border-border/50 mb-3">
  {(() => {
    const SelectedIcon = getIconForEmoji(selectedEmoji);
    return <SelectedIcon size={32} />;
  })()}
  </div>
  <span className="font-dm text-xs text-text-secondary mb-3">
  Selecciona un ícono para el grupo
  </span>
  <div className="flex flex-wrap justify-center gap-2">
  {EMOJIS.map((emoji) => {
    const Icon = getIconForEmoji(emoji);
    return (
      <motion.button
        key={emoji}
        type="button"
        onClick={() => setSelectedEmoji(emoji)}
        className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
        selectedEmoji === emoji
        ? 'bg-primary text-white border-2 border-primary shadow-blue-sm scale-110'
        : 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3'
        )}
        whileTap={{ scale: 0.9 }}
      >
        <Icon size={20} />
      </motion.button>
    );
  })}
  </div>
 </div>

 {/* Group Info Form */}
 <div className="space-y-4">
 <Input
 label="Nombre del grupo"
 value={name}
 onChange={(e) => {
 setName(e.target.value);
 if (e.target.value.trim()) setNameError('');
 }}
 error={nameError}
 placeholder="Ej. Casa de los Cuates"
 />

 <div className="relative">
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Descripción del grupo (opcional)..."
 className="w-full px-4 py-3 bg-surface border border-border rounded-xl font-dm text-xs sm:text-sm text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
 rows={3}
 maxLength={150}
 aria-label="Descripción del grupo"
 />
 </div>
 </div>

  {/* Members Selector Section */}
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="font-syne font-bold text-sm text-text-primary flex items-center gap-1.5">
        <Users size={16} className="text-primary" />
        <span>Añadir integrantes (Buscar)</span>
      </h2>
      <span className="font-dm text-xs text-text-secondary">
        {selectedMembers.length} seleccionados
      </span>
    </div>

    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-all shadow-inner-sm"
      />
    </div>

    <div className="bg-surface/50 backdrop-blur-md border border-border/60 rounded-3xl p-2 space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide shadow-inner">
      {availableUsers
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((friend) => {
        const isSelected = selectedMembers.includes(friend.id);
        
        let badges: string[] = [];
        try { if (friend.userXp?.badges) badges = JSON.parse(friend.userXp.badges); } catch (e) {}

        return (
          <motion.button
            key={friend.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleToggleMember(friend.id)}
            className={cn(
              "w-full flex items-center justify-between p-3 text-left transition-all duration-200 rounded-2xl border",
              isSelected 
                ? "bg-primary/5 border-primary/30 shadow-sm" 
                : "bg-surface hover:bg-surface-2 border-transparent"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0 flex items-center justify-center text-white font-syne font-bold text-xs shadow-blue-sm relative">
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(friend.name)
                )}
                {/* Nivel indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center shadow-sm">
                  <span className="text-[9px] text-text-primary font-bold">{friend.userXp?.level || 1}</span>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-dm text-sm font-semibold text-text-primary truncate">
                  {friend.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield size={10} className="text-primary" />
                  <span className="text-[10px] text-text-secondary truncate">
                    {badges.length > 0 ? `${badges.length} Insignias` : 'Nuevo en FinSense'}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                isSelected
                  ? 'bg-primary border-primary text-white shadow-blue-sm scale-110'
                  : 'border-border bg-surface-2'
              )}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
      {availableUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
        <div className="p-4 text-center text-sm text-text-secondary font-dm">
          No se encontraron usuarios
        </div>
      )}
    </div>
  </div>

 {/* Submit Button */}
 <div className="pt-2">
 <Button
 fullWidth
 loading={isLoading}
 onClick={handleSave}
 className="from-primary to-primary-light"
 >
 Crear grupo
 </Button>
 </div>
 </div>

 {/* Success Animation */}
 <AnimatePresence>
 {showSuccess && (
 <SuccessAnimation onDone={() => router.push('/groups')} />
 )}
 </AnimatePresence>
 </div>
 );
}
