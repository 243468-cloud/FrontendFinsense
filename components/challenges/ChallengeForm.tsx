import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { createChallenge } from '@/services/challengeService';
import api from '@/lib/apiClient';
import { getTodayISO } from '@/lib/utils';
import { Target, Users, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

export function ChallengeForm({ onSuccess }: { onSuccess: () => void }) {
  const { closeBottomSheet, addToast } = useUIStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState('');
  
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/groups').then(res => setGroups(res.data)).catch((e: any) => { console.error(e); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !groupId || !targetAmount || !startDate || !endDate) {
      return addToast({ message: 'Llena los campos obligatorios', type: 'error' });
    }
    
    if (startDate < getTodayISO()) {
      return addToast({ message: 'La fecha de inicio no puede ser en el pasado', type: 'error' });
    }
    
    if (endDate < startDate) {
      return addToast({ message: 'La fecha de fin debe ser posterior o igual a la de inicio', type: 'error' });
    }

    setLoading(true);
    try {
      await createChallenge({
        title,
        description,
        groupId,
        targetAmount: Number(targetAmount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      addToast({ message: 'Reto creado con éxito', type: 'success' });
      onSuccess();
      closeBottomSheet();
    } catch (err) {
      addToast({ message: 'Error al crear reto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 bg-surface rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
          <Target className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="font-syne font-bold text-xl text-text-primary leading-tight">Nuevo Reto Grupal</h2>
          <p className="font-dm text-xs text-text-secondary">Configura un objetivo de ahorro colaborativo</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-dm text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Título del Reto</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Target size={16} className="text-text-secondary/60" />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Mes sin comida rápida"
            className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-dm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-dm text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Grupo</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Users size={16} className="text-text-secondary/60" />
          </div>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-dm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
            required
          >
            <option value="">Selecciona un grupo...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-dm text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Límite de Gasto ($)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <DollarSign size={16} className="text-text-secondary/60" />
          </div>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-dm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            required
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-dm text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Inicio</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <CalendarIcon size={16} className="text-text-secondary/60" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={getTodayISO()}
              className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-10 pr-2 sm:pr-4 text-xs sm:text-sm font-dm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="font-dm text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Fin</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <CalendarIcon size={16} className="text-text-secondary/60" />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || getTodayISO()}
              className="w-full bg-surface-2 border border-border rounded-xl py-3 pl-10 pr-2 sm:pr-4 text-xs sm:text-sm font-dm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-dm font-bold text-sm rounded-xl py-3.5 mt-2 disabled:opacity-50 transition-all shadow-blue-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/> Guardando...
          </span>
        ) : (
          <>Crear Reto <Target size={18} /></>
        )}
      </button>
    </form>
  );
}
