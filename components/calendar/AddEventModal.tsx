import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Type, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { getIconForEmoji, getTodayISO } from '@/lib/utils';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; amount?: number; date: string; emoji: string }) => void;
  selectedDate: Date;
}

const EMOJI_OPTIONS = ['📅', '💼', '🏥', '🎉', '✈️', '🛒', '🏡', '🎓', '💸', '🛠️'];

export function AddEventModal({ isOpen, onClose, onAdd, selectedDate }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate.toISOString().split('T')[0]);
  const [emoji, setEmoji] = useState('📅');
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    
    if (date < getTodayISO()) {
      addToast({ message: 'La fecha no puede ser en el pasado', type: 'error' });
      return;
    }

    
    setIsLoading(true);
    await onAdd({
      title,
      amount: amount ? parseFloat(amount) : undefined,
      date,
      emoji
    });
    
    setIsLoading(false);
    setTitle('');
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-xl overflow-hidden z-10 p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-surface-3 text-text-secondary transition-colors"
          >
            <X size={20} />
          </button>
          
          <h3 className="font-syne font-bold text-xl text-text-primary mb-6 flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24} />
            Nuevo Evento Financiero
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-dm text-xs font-semibold text-text-secondary uppercase">
                Título del Evento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <Type size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text-primary rounded-xl pl-10 pr-4 py-2.5 font-dm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Ej. Pago de Tenencia"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-dm text-xs font-semibold text-text-secondary uppercase">
                Monto (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <DollarSign size={16} />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text-primary rounded-xl pl-10 pr-4 py-2.5 font-dm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-dm text-xs font-semibold text-text-secondary uppercase">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={getTodayISO()}
                  className="w-full bg-surface-2 border border-border text-text-primary rounded-xl px-4 py-2.5 font-dm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="font-dm text-xs font-semibold text-text-secondary uppercase">
                Icono Representativo
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(opt => {
                  const Icon = getIconForEmoji(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEmoji(opt)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${emoji === opt ? 'bg-primary/20 border-2 border-primary text-primary' : 'bg-surface-2 border border-border opacity-70 hover:opacity-100 text-text-secondary'}`}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              variant="primary" 
              loading={isLoading}
            >
              Guardar Evento
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
