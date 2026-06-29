'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';
import { createGroup } from '@/services/groupService';
import { cn } from '@/lib/utils';

const EMOJIS = ['🏛️', '🏠', '🍔', '🚗', '✈️', '🎒', '🛒', '🎮', '⚽', '🍻'];

const MOCK_FRIENDS = [
  { id: 'user_002', name: 'Sofía López' },
  { id: 'user_003', name: 'Diego Morales' },
  { id: 'user_004', name: 'Carlos Ruiz' },
  { id: 'user_005', name: 'Andrés Jiménez' }
];

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
        memberIds: ['user_001', ...selectedMembers]
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
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-4xl shadow-blue-sm border border-border/50 mb-3">
            {selectedEmoji}
          </div>
          <span className="font-dm text-xs text-text-secondary mb-3">
            Selecciona un ícono para el grupo
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all',
                  selectedEmoji === emoji
                    ? 'bg-primary text-white border-2 border-primary shadow-blue-sm scale-110'
                    : 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3'
                )}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-sm text-text-primary flex items-center gap-1.5">
              <Users size={16} className="text-primary" />
              <span>Añadir integrantes</span>
            </h2>
            <span className="font-dm text-xs text-text-secondary">
              {selectedMembers.length} seleccionados
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-2 divide-y divide-border">
            {MOCK_FRIENDS.map((friend) => {
              const isSelected = selectedMembers.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => handleToggleMember(friend.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-2 transition-colors duration-150 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-xs">
                      {friend.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-dm text-sm font-semibold text-text-primary">
                      {friend.name}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'border-border bg-transparent'
                    )}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
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
