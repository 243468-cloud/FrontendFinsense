import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { createInvestment, updateInvestment } from '@/services/investmentService';
import { getTodayISO } from '@/lib/utils';

export function InvestmentForm({
  initialData,
  onSuccess,
}: {
  initialData?: { id: string; name: string; type: string; initialAmount: number; currentValue: number; purchaseDate: string; notes?: string };
  onSuccess: () => void;
}) {
  const { closeBottomSheet, addToast } = useUIStore();
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Cetes');
  const [initialAmount, setInitialAmount] = useState(initialData?.initialAmount?.toString() || '');
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate?.split('T')[0] || getTodayISO());
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialAmount || !currentValue) return addToast({ message: 'Llena los campos obligatorios', type: 'error' });
    setLoading(true);
    try {
      if (initialData) {
        await updateInvestment(initialData.id, { 
          name, 
          currentValue: Number(currentValue),
          notes 
        });
        addToast({ message: 'Inversión actualizada', type: 'success' });
      } else {
        await createInvestment({ 
          name, 
          type, 
          initialAmount: Number(initialAmount), 
          currentValue: Number(currentValue), 
          purchaseDate: new Date(purchaseDate).toISOString(),
          notes,
          ticker: (type === 'Stock' || type === 'Crypto') && ticker ? ticker : undefined,
          shares: (type === 'Stock' || type === 'Crypto') && shares ? Number(shares) : undefined
        });
        addToast({ message: 'Inversión creada', type: 'success' });
      }
      onSuccess();
      closeBottomSheet();
    } catch (err) {
      addToast({ message: 'Error al guardar inversión', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="font-syne font-bold text-lg text-text-primary mb-2">
        {initialData ? 'Editar Inversión' : 'Nueva Inversión'}
      </h2>

      <div className="space-y-1">
        <label className="font-dm text-xs font-semibold text-text-secondary">Nombre de Inversión</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Cetes a 1 mes"
          className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
          required
        />
      </div>

      {!initialData && (
        <>
          <div className="space-y-1">
            <label className="font-dm text-xs font-semibold text-text-secondary">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="Cetes">Cetes / Deuda Gubernamental</option>
              <option value="Stock">Acciones / Bolsa</option>
              <option value="Crypto">Criptomonedas</option>
              <option value="Business">Negocio</option>
              <option value="Other">Otro</option>
            </select>
          </div>

          {(type === 'Stock' || type === 'Crypto') && (
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="font-dm text-xs font-semibold text-text-secondary">Símbolo / Ticker</label>
                <input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder={type === 'Stock' ? 'AAPL, TSLA...' : 'BTC-USD, ETH-USD...'}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="font-dm text-xs font-semibold text-text-secondary">Cantidad (Shares)</label>
                <input
                  type="number"
                  step="any"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="Ej. 1.5"
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-dm text-xs font-semibold text-text-secondary">Monto Inicial ($)</label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
              required
              min="1"
            />
          </div>

          <div className="space-y-1">
            <label className="font-dm text-xs font-semibold text-text-secondary">Fecha de Compra</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={getTodayISO()}
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
              required
            />
          </div>
        </>
      )}

      <div className="space-y-1">
        <label className="font-dm text-xs font-semibold text-text-secondary">
          Valor Actual ($) {(!initialData && (type === 'Stock' || type === 'Crypto') && ticker && shares) && <span className="text-primary font-normal text-[10px] ml-1">(Se auto-calculará si es válido)</span>}
        </label>
        <input
          type="number"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
          required={!((type === 'Stock' || type === 'Crypto') && ticker && shares)}
          min="1"
        />
      </div>
      
      <div className="space-y-1">
        <label className="font-dm text-xs font-semibold text-text-secondary">Notas (Opcional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-dm font-semibold text-sm rounded-xl py-3 mt-2 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
