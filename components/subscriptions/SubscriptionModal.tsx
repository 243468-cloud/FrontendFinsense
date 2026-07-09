import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Subscription, createSubscription, updateSubscription } from '@/services/subscriptionService';
import { useUIStore } from '@/store/uiStore';
import { cn, getTodayISO } from '@/lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription;
}

export function SubscriptionModal({ isOpen, onClose, onSuccess, subscription }: SubscriptionModalProps) {
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    cost: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    category: string;
  }>({
    name: '',
    cost: '',
    billingCycle: 'monthly',
    nextBillingDate: '',
    category: 'entertainment'
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        cost: subscription.cost.toString(),
        billingCycle: subscription.billingCycle,
        nextBillingDate: new Date(subscription.nextBillingDate).toISOString().split('T')[0],
        category: subscription.category || 'entertainment'
      });
    } else {
      setFormData({
        name: '',
        cost: '',
        billingCycle: 'monthly',
        nextBillingDate: new Date().toISOString().split('T')[0],
        category: 'entertainment'
      });
    }
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (subscription) {
        await updateSubscription(subscription.id, {
          ...formData,
          cost: parseFloat(formData.cost),
        });
        addToast({ message: 'Suscripción actualizada', type: 'success' });
      } else {
        await createSubscription({
          ...formData,
          cost: parseFloat(formData.cost),
          currency: 'MXN',
        });
        addToast({ message: 'Suscripción agregada', type: 'success' });
      }
      onSuccess();
      onClose();
    } catch (error) {
      addToast({ message: 'Error al guardar suscripción', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-10"
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
            <h2 className="font-syne font-bold text-lg text-text-primary">
              {subscription ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 text-text-secondary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block font-dm text-xs font-semibold text-text-secondary mb-1.5">Nombre del Servicio</label>
              <input
                required
                type="text"
                placeholder="Ej. Netflix, Gimnasio..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-dm text-sm"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-dm text-xs font-semibold text-text-secondary mb-1.5">Costo</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-dm text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block font-dm text-xs font-semibold text-text-secondary mb-1.5">Ciclo de facturación</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-dm text-sm"
                >
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-dm text-xs font-semibold text-text-secondary mb-1.5">Próximo Cobro</label>
              <input
                required
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                min={getTodayISO()}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-dm text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl font-dm font-semibold text-sm transition-all mt-4",
                loading ? "bg-primary/50 text-white cursor-not-allowed" : "bg-primary hover:bg-primary-hover text-white shadow-blue-sm"
              )}
            >
              {loading ? 'Guardando...' : 'Guardar Suscripción'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
