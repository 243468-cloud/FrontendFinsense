'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  FileText, 
  DollarSign, 
  ArrowRightLeft, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  getGroup, 
  getGroupExpenses, 
  addGroupExpense, 
  calculateDebts, 
  addGroupMember, 
  removeGroupMember 
} from '@/services/groupService';
import { formatCurrency, formatRelativeDate, getInitials, getIconForEmoji } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { Group, GroupExpense } from '@/types/group.types';

interface GroupDetailPageProps {
  params: {
    id: string;
  };
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id: groupId } = params;
  const router = useRouter();
  const { addToast } = useUIStore();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for new shared expense
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePayer, setExpensePayer] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form state for new member
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    async function loadGroupData() {
      setIsLoading(true);
      try {
        const [g, e] = await Promise.all([
          getGroup(groupId),
          getGroupExpenses(groupId)
        ]);
        setGroup(g);
        setExpenses(e);
        if (g.members.length > 0) {
          setExpensePayer(g.members[0].userId); // Default payer to the first member
        }
      } catch {
        addToast({ message: 'Error al cargar detalles del grupo', type: 'error' });
        router.push('/groups');
      } finally {
        setIsLoading(false);
      }
    }
    loadGroupData();
  }, [groupId, addToast, router]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;

    const amount = parseFloat(expenseAmount);
    if (!amount || amount <= 0) {
      addToast({ message: 'Ingresa un monto válido', type: 'warning' });
      return;
    }
    if (!expenseNote.trim()) {
      addToast({ message: 'Ingresa una descripción para el gasto', type: 'warning' });
      return;
    }

    setIsSubmittingExpense(true);
    try {
      const addedExpense = await addGroupExpense(groupId, {
        description: expenseNote,
        amount,
        paidBy: expensePayer,
        splitWith: group.members.map(m => m.userId), // Split equally among all members
      });

      // Recalculate group totals and member balances locally
      const updatedMembers = group.members.map((m) => {
        const splitShare = amount / group.members.length;
        const paidAmount = m.userId === expensePayer ? amount : 0;
        return {
          ...m,
          balance: m.balance + (paidAmount - splitShare)
        };
      });

      setGroup({
        ...group,
        totalExpenses: group.totalExpenses + amount,
        members: updatedMembers,
        lastActivity: new Date().toISOString()
      });

      setExpenses([addedExpense, ...expenses]);
      setExpenseNote('');
      setExpenseAmount('');
      setShowAddExpense(false);
      addToast({ message: 'Gasto registrado y dividido', type: 'success' });
    } catch {
      addToast({ message: 'Error al registrar el gasto', type: 'error' });
    } finally {
      setIsSubmittingExpense(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsAddingMember(true);
    try {
      const updatedGroup = await addGroupMember(groupId, newMemberName.trim());
      setGroup(updatedGroup);
      setNewMemberName('');
      addToast({ message: `${newMemberName} añadido al grupo`, type: 'success' });
    } catch {
      addToast({ message: 'Error al añadir miembro', type: 'error' });
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (userId === 'user_001') {
      addToast({ message: 'No puedes salir del grupo tú mismo', type: 'warning' });
      return;
    }

    try {
      const updatedGroup = await removeGroupMember(groupId, userId);
      setGroup(updatedGroup);
      addToast({ message: `${name} eliminado del grupo`, type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar miembro', type: 'error' });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-dm text-xs text-text-secondary">Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) return null;

  const debts = calculateDebts(group);
  const GroupIcon = getIconForEmoji(group.emoji);

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/groups')}
            className="touch-target rounded-xl hover:bg-surface-2 transition-colors"
            aria-label="Volver a Grupos"
          >
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GroupIcon size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-sm sm:text-base text-text-primary leading-tight">{group.name}</h1>
              <p className="font-dm text-[10px] text-text-secondary">Creado por ti</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4 space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6">
        
        {/* Description Banner */}
        {group.description && (
          <div className="bg-white border border-border rounded-2xl p-4 shadow-card">
            <p className="font-dm text-xs text-text-secondary leading-relaxed">
              {group.description}
            </p>
          </div>
        )}

        {/* ─── Balances Resumidos ("Quién le debe a quién") ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white border border-border rounded-2xl p-4 shadow-card space-y-3"
        >
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h2 className="font-syne font-bold text-sm text-text-primary flex items-center gap-1.5">
              <ArrowRightLeft size={16} className="text-primary" />
              Saldos del Grupo
            </h2>
            <span className="font-mono text-xs font-bold text-primary">
              Total: {formatCurrency(group.totalExpenses)}
            </span>
          </div>

          {debts.length === 0 ? (
            <p className="font-dm text-xs text-text-secondary text-center py-4">
              Todos están a mano. ¡No hay deudas activas! 🙌
            </p>
          ) : (
            <div className="space-y-2">
              {debts.map((debt, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-surface-2 p-2.5 rounded-xl border border-border text-xs font-dm"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-red-600">{debt.from === 'user_001' ? 'Tú' : debt.fromName}</span>
                    <span className="text-text-secondary">le debe a</span>
                    <span className="font-bold text-success">{debt.to === 'user_001' ? 'ti' : debt.toName}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{formatCurrency(debt.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Formulario para Registrar Gasto Compartido ─── */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-syne font-bold text-sm text-text-primary">Gastos divididos</h2>
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="text-xs font-dm font-bold text-primary flex items-center gap-1 hover:underline touch-target"
            >
              {showAddExpense ? 'Cerrar formulario' : 'Registrar gasto +'}
            </button>
          </div>

          <AnimatePresence>
            {showAddExpense && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white border border-border rounded-2xl p-4 shadow-card space-y-4 overflow-hidden"
              >
                <h3 className="font-syne font-bold text-xs sm:text-sm text-text-primary">Dividir Gasto Nuevo</h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Descripción"
                      type="text"
                      placeholder="Ej. Súper / Luz"
                      value={expenseNote}
                      onChange={(e) => setExpenseNote(e.target.value)}
                      icon={<FileText size={16} />}
                      required
                    />
                    <Input
                      label="Importe ($)"
                      type="number"
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      icon={<DollarSign size={16} />}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="payer" className="font-dm text-xs text-text-secondary pl-1">Pagado por</label>
                    <select
                      id="payer"
                      value={expensePayer}
                      onChange={(e) => setExpensePayer(e.target.value)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2.5 font-dm text-xs sm:text-sm text-text-primary outline-none focus:border-primary transition-all"
                    >
                      {group.members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.userId === 'user_001' ? 'Tú' : m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-surface-2 p-2.5 rounded-xl border border-border text-[11px] text-text-secondary leading-normal">
                    💡 <strong>División equitativa:</strong> El gasto se dividirá automáticamente en partes iguales entre los {group.members.length} miembros.
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    loading={isSubmittingExpense}
                    icon={<Plus size={16} />}
                    className="font-syne font-bold text-xs"
                  >
                    Registrar y Dividir Gasto
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Gestión de Miembros del Grupo ─── */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white border border-border rounded-2xl p-4 shadow-card space-y-4"
        >
          <div className="flex items-center gap-1.5 border-b border-border pb-2">
            <Users size={16} className="text-primary" />
            <h2 className="font-syne font-bold text-sm text-text-primary">Miembros ({group.members.length})</h2>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {group.members.map((member) => (
              <div 
                key={member.userId} 
                className="flex items-center justify-between py-1 border-b border-surface-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-xs">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-dm text-xs font-semibold text-text-primary">
                      {member.userId === 'user_001' ? 'Tú (Administrador)' : member.name}
                    </p>
                    <p className="font-mono text-[10px] text-text-secondary">
                      Balance: <span className={member.balance >= 0 ? 'text-success font-semibold' : 'text-red-500 font-semibold'}>
                        {member.balance >= 0 ? '+' : ''}{formatCurrency(member.balance)}
                      </span>
                    </p>
                  </div>
                </div>

                {member.userId !== 'user_001' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.userId, member.name)}
                    className="text-text-secondary hover:text-red-500 transition-colors p-1"
                    aria-label={`Eliminar a ${member.name} del grupo`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add member Form */}
          <form onSubmit={handleAddMember} className="flex gap-2 pt-2 border-t border-border">
            <div className="flex-1 relative">
              <UserPlus 
                size={14} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" 
              />
              <input
                type="text"
                placeholder="Nombre del integrante..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                disabled={isAddingMember}
                className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2 font-dm text-xs text-text-primary outline-none focus:bg-white focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingMember || !newMemberName.trim()}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl px-3 py-2 text-xs font-syne font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-1 touch-target"
            >
              <span>Añadir</span>
            </button>
          </form>
        </motion.div>

        {/* ─── Historial del Grupo Específico ─── */}
        <div className="space-y-2">
          <h2 className="font-syne font-bold text-sm text-text-primary px-1">Historial del grupo</h2>
          <div className="space-y-2">
            {expenses.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-6 text-center shadow-card text-xs text-text-secondary font-dm">
                <Calendar size={24} className="text-text-secondary/50 mx-auto mb-2" />
                No hay gastos registrados en este grupo.
              </div>
            ) : (
              expenses.map((expense) => {
                const payerName = group.members.find(m => m.userId === expense.paidBy)?.name ?? 'Miembro';
                return (
                  <div 
                    key={expense.id} 
                    className="bg-white border border-border rounded-2xl p-3.5 flex items-center justify-between shadow-card text-xs font-dm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-primary">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{expense.description}</p>
                        <p className="text-[10px] text-text-secondary">
                          Pagado por <span className="font-bold">{expense.paidBy === 'user_001' ? 'ti' : payerName}</span> · {formatRelativeDate(expense.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-red-500">-{formatCurrency(expense.amount)}</span>
                      <p className="text-[9px] text-text-secondary">Dividido equitativamente</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
