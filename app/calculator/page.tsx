'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, Plus, Trash2, Snowflake, Mountain } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Debt = {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
};

export default function CalculatorPage() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Tarjeta de Crédito', balance: 5000, interestRate: 45, minPayment: 250 },
    { id: '2', name: 'Préstamo Personal', balance: 10000, interestRate: 20, minPayment: 500 },
  ]);
  const [extraPayment, setExtraPayment] = useState(500);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  const addDebt = () => {
    setDebts([...debts, { id: Date.now().toString(), name: 'Nueva Deuda', balance: 1000, interestRate: 15, minPayment: 100 }]);
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const calculatePayoff = () => {
    if (debts.length === 0) return { months: 0, totalInterest: 0, timeline: [] };
    
    let currentDebts = debts.map(d => ({ ...d }));
    let months = 0;
    let totalInterest = 0;
    const timeline = [];

    // Sort debts based on strategy
    if (strategy === 'snowball') {
      currentDebts.sort((a, b) => a.balance - b.balance);
    } else {
      currentDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    while (currentDebts.some(d => d.balance > 0) && months < 360) {
      months++;
      let availableCash = currentDebts.reduce((acc, d) => acc + (d.balance > 0 ? d.minPayment : 0), 0) + extraPayment;
      
      // Apply interest
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const interest = d.balance * (d.interestRate / 100 / 12);
          d.balance += interest;
          totalInterest += interest;
        }
      });

      // Pay minimums
      currentDebts.forEach(d => {
        if (d.balance > 0) {
          const payment = Math.min(d.minPayment, d.balance);
          d.balance -= payment;
          availableCash -= payment;
        }
      });

      // Apply remaining cash to target debt
      const targetDebt = currentDebts.find(d => d.balance > 0);
      if (targetDebt && availableCash > 0) {
        const payment = Math.min(availableCash, targetDebt.balance);
        targetDebt.balance -= payment;
      }
      
      if (months % 3 === 0 || !currentDebts.some(d => d.balance > 0)) {
        timeline.push({
          month: months,
          remaining: currentDebts.reduce((acc, d) => acc + d.balance, 0)
        });
      }
    }

    return { months, totalInterest, timeline };
  };

  const { months, totalInterest } = calculatePayoff();
  const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3.5 flex items-center shadow-sm">
        <button onClick={() => router.push('/dashboard')} className="p-2 mr-3 rounded-xl hover:bg-surface-3 transition-colors">
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <div>
          <h1 className="font-syne font-bold text-lg text-text-primary flex items-center gap-2">
            <Calculator size={18} className="text-primary" /> Calculadora de Deudas
          </h1>
          <p className="font-dm text-xs text-text-secondary">Planifica cómo salir de deudas rápido</p>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Debts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-syne font-bold text-lg text-text-primary">Tus Deudas</h2>
            <button onClick={addDebt} className="text-primary text-sm font-dm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Agregar
            </button>
          </div>
          
          <AnimatePresence>
            {debts.map(debt => (
              <motion.div 
                key={debt.id} 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="font-dm text-[10px] text-text-secondary uppercase font-bold">Nombre</label>
                    <input 
                      value={debt.name} 
                      onChange={e => updateDebt(debt.id, 'name', e.target.value)}
                      className="w-full bg-surface-2 border-b border-border p-1 text-sm font-dm text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-dm text-[10px] text-text-secondary uppercase font-bold">Saldo ($)</label>
                      <input 
                        type="number" value={debt.balance} 
                        onChange={e => updateDebt(debt.id, 'balance', Number(e.target.value))}
                        className="w-full bg-surface-2 border-b border-border p-1 text-sm font-dm font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-dm text-[10px] text-text-secondary uppercase font-bold">Interés (%)</label>
                      <input 
                        type="number" value={debt.interestRate} 
                        onChange={e => updateDebt(debt.id, 'interestRate', Number(e.target.value))}
                        className="w-full bg-surface-2 border-b border-border p-1 text-sm font-dm font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="font-dm text-[10px] text-text-secondary uppercase font-bold">Pago Min ($)</label>
                      <input 
                        type="number" value={debt.minPayment} 
                        onChange={e => updateDebt(debt.id, 'minPayment', Number(e.target.value))}
                        className="w-full bg-surface-2 border-b border-border p-1 text-sm font-dm font-mono focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center sm:items-start justify-end sm:justify-start">
                  <button onClick={() => removeDebt(debt.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {debts.length === 0 && (
            <div className="text-center p-8 text-text-secondary bg-surface-2 rounded-2xl border border-dashed border-border">
              Agrega tus deudas para calcular tu plan de pago.
            </div>
          )}
        </div>

        {/* Strategy & Results */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl p-5 border border-border shadow-card">
            <h3 className="font-syne font-bold text-base text-text-primary mb-4">Estrategia</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => setStrategy('avalanche')}
                className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all", strategy === 'avalanche' ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-2 text-text-secondary")}
              >
                <Mountain size={20} />
                <span className="font-dm text-xs font-bold leading-tight">Avalancha<br/><span className="font-normal text-[10px]">Tasa más alta</span></span>
              </button>
              <button 
                onClick={() => setStrategy('snowball')}
                className={cn("flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all", strategy === 'snowball' ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-2 text-text-secondary")}
              >
                <Snowflake size={20} />
                <span className="font-dm text-xs font-bold leading-tight">Bola de Nieve<br/><span className="font-normal text-[10px]">Saldo menor</span></span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex justify-between font-dm text-sm text-text-secondary font-bold">
                Pago Extra Mensual <span>{formatCurrency(extraPayment)}</span>
              </label>
              <input 
                type="range" min="0" max="5000" step="100" 
                value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-text-secondary leading-tight mt-1">
                Dinero extra destinado al pago de la deuda objetivo.
              </p>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="font-syne font-bold text-lg mb-4 relative z-10">Tu Plan de Pago</h3>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-dm text-sm text-white/80">Deuda Total</span>
                <span className="font-mono font-bold text-lg">{formatCurrency(totalBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-dm text-sm text-white/80">Intereses Totales</span>
                <span className="font-mono font-bold text-lg text-red-200">+{formatCurrency(totalInterest)}</span>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div className="flex justify-between items-center">
                <span className="font-dm text-sm text-white/80">Tiempo Estimado</span>
                <span className="font-mono font-bold text-xl text-yellow-300">
                  {months >= 360 ? '> 30 años' : `${Math.floor(months / 12)}a ${months % 12}m`}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
