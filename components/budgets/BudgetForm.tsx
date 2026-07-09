import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { getBudgetCategories, createBudget, updateBudget, deleteBudget } from '@/services/budgetService';
import { ChevronDown, Check } from 'lucide-react';
import { getIconForEmoji } from '@/lib/utils';

export function BudgetForm({
  initialData,
  onSuccess,
}: {
  initialData?: { id: string; categoryId: string; limit: number };
  onSuccess: () => void;
}) {
  const { closeBottomSheet, addToast } = useUIStore();
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; color: string }[]>([]);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [limit, setLimit] = useState(initialData?.limit?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getBudgetCategories().then(setCategories).catch((e: any) => { console.error(e); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !limit) return addToast({ message: 'Llena todos los campos', type: 'error' });
    setLoading(true);
    try {
      if (initialData) {
        await updateBudget(initialData.id, Number(limit));
        addToast({ message: 'Presupuesto actualizado', type: 'success' });
      } else {
        await createBudget({ categoryId, limitAmount: Number(limit) });
        addToast({ message: 'Presupuesto creado', type: 'success' });
      }
      onSuccess();
      closeBottomSheet();
    } catch (err) {
      addToast({ message: 'Error al guardar presupuesto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) return;
    setLoading(true);
    try {
      await deleteBudget(initialData.id);
      addToast({ message: 'Presupuesto eliminado', type: 'success' });
      onSuccess();
      closeBottomSheet();
    } catch (err) {
      addToast({ message: 'Error al eliminar presupuesto', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="font-syne font-bold text-lg text-text-primary mb-2">
        {initialData ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      </h2>

      {!initialData && (
        <div className="space-y-1 relative">
          <label className="font-dm text-xs font-semibold text-text-secondary">Categoría</label>
          <div 
            className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              {categoryId ? (
                <>
                  <span className="w-5 h-5 flex items-center justify-center text-primary">
                    {(() => {
                      const Icon = getIconForEmoji(categories.find(c => c.id === categoryId)?.icon || '');
                      return <Icon size={20} />;
                    })()}
                  </span>
                  <span>{categories.find(c => c.id === categoryId)?.name}</span>
                </>
              ) : (
                <span className="text-text-secondary">Selecciona una categoría...</span>
              )}
            </div>
            <ChevronDown size={16} className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-blue-md max-h-48 overflow-y-auto">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 hover:bg-surface-2 cursor-pointer transition-colors"
                  onClick={() => {
                    setCategoryId(c.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="w-8 h-8 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
                    {(() => {
                      const Icon = getIconForEmoji(c.icon);
                      return <Icon size={20} />;
                    })()}
                  </span>
                  <span className="font-dm text-sm text-text-primary">{c.name}</span>
                  {c.id === categoryId && <Check size={16} className="ml-auto text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="font-dm text-xs font-semibold text-text-secondary">Límite Mensual ($)</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Ej. 1500"
          className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
          required
          min="1"
        />
      </div>

      <div className="flex gap-3 mt-4">
        {initialData && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-50 text-red-500 font-dm font-semibold text-sm rounded-xl py-3 disabled:opacity-50 hover:bg-red-100 transition-colors"
          >
            Eliminar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] bg-primary text-white font-dm font-semibold text-sm rounded-xl py-3 disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
