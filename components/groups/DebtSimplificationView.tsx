import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SimplifiedDebt {
  from: { id: string; name: string; avatar?: string };
  to: { id: string; name: string; avatar?: string };
  amount: number;
}

interface Props {
  groupId: string;
  onRefresh: () => void;
}

export function DebtSimplificationView({ groupId, onRefresh }: Props) {
  const { user } = useAuthStore();
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimplifiedDebts();
  }, [groupId]);

  const loadSimplifiedDebts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/groups/${groupId}/debts/simplified`);
      setDebts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUp = async (debt: SimplifiedDebt) => {
    // Para simplificar, registramos un gasto donde el que recibe la deuda "pagó" por el que la debe,
    // o registramos un pago directo si tuviéramos un endpoint específico.
    // Como tenemos `GroupExpense`, podemos registrar un gasto a nombre de "debt.to"
    // donde "debt.from" es el único que debe (splitBetween = [debt.from.id])
    
    try {
      await apiClient.post(`/groups/${groupId}/expenses`, {
        description: `Liquidación de deuda (${debt.from.name} a ${debt.to.name})`,
        amount: debt.amount,
        paidBy: debt.from.id, // El que debía acaba de pagar
        splitBetween: [debt.to.id], // El dinero va hacia el acreedor (lo dividimos solo hacia él)
        // Wait, si el que debe paga, el acreedor recibe el dinero.
        // Si "from" paga a "to", "from" pagó un gasto que era para "to".
      });
      await loadSimplifiedDebts();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-4 text-center text-xs text-text-secondary">Calculando rutas eficientes...</div>;

  if (debts.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={24} />
        </div>
        <p className="font-syne font-bold text-sm text-text-primary">¡Todo saldado!</p>
        <p className="font-dm text-xs text-text-secondary">No hay deudas pendientes en el grupo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt, index) => {
        const isUserInvolved = user?.id === debt.from.id || user?.id === debt.to.id;
        return (
          <div key={index} className={`bg-surface border p-3 rounded-2xl flex items-center justify-between ${isUserInvolved ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="font-syne font-bold text-xs">{debt.from.name}</span>
              </div>
              <ArrowRight size={14} className="text-text-secondary" />
              <div className="flex flex-col items-center">
                <span className="font-syne font-bold text-xs">{debt.to.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-primary">{formatCurrency(debt.amount)}</span>
              {user?.id === debt.from.id && (
                <Button size="sm" onClick={() => handleSettleUp(debt)}>Pagar</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
