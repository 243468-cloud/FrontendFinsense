'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Users, Landmark, DollarSign, Calendar, UserPlus, FileText, Check, X } from 'lucide-react';
import { getGroup, getGroupExpenses, addGroupExpense, calculateDebts } from '@/services/groupService';
import { getUsers } from '@/services/authService';
import apiClient from '@/lib/apiClient';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { Group, GroupExpense, DebtSummary } from '@/types/group.types';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [debts, setDebts] = useState<DebtSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'members'>('expenses');

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // New Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseSplit, setExpenseSplit] = useState<string[]>([]);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // New Member form state
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submittingMember, setSubmittingMember] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupData = await getGroup(groupId);
      setGroup(groupData);
      
      const expensesData = await getGroupExpenses(groupId);
      setExpenses(expensesData);

      const computedDebts = calculateDebts(groupData);
      setDebts(computedDebts);
      
      if (groupData.members.length > 0) {
        // Default paidBy to current user if member of group, else first member
        const isMember = groupData.members.find(m => m.userId === currentUser?.id);
        setExpensePaidBy(isMember ? currentUser?.id || '' : groupData.members[0].userId);
        // Default split between all members
        setExpenseSplit(groupData.members.map(m => m.userId));
      }
    } catch (err) {
      addToast({ message: 'Error cargando datos del grupo', type: 'error' });
      router.push('/groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  // Load available users when opening the add member modal
  const openMemberModal = async () => {
    setShowMemberModal(true);
    try {
      setLoadingUsers(true);
      const allUsers = await getUsers();
      // Filter out users who are already members of the group
      const currentMemberIds = group?.members.map(m => m.userId) || [];
      const filtered = allUsers.filter(u => !currentMemberIds.includes(u.id));
      setAvailableUsers(filtered);
      if (filtered.length > 0) {
        setSelectedUserId(filtered[0].id);
      }
    } catch (err) {
      addToast({ message: 'Error cargando usuarios disponibles', type: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
      addToast({ message: 'Por favor, llena los campos con valores válidos', type: 'error' });
      return;
    }
    if (expenseSplit.length === 0) {
      addToast({ message: 'Selecciona al menos una persona para dividir el gasto', type: 'error' });
      return;
    }

    try {
      setSubmittingExpense(true);
      // Wait for adding the expense
      const amountNum = Number(expenseAmount);
      
      // Call groupService directly
      // Since the backend addExpense expects userId from the token, and uses paidBy: userId,
      // note: if paidBy selected is different than current user, it might be split differently,
      // but the backend API currently forces paidBy = req.user.id. So let's handle that gracefully.
      const payload = {
        amount: amountNum,
        title: expenseTitle,
        splitBetween: expenseSplit,
      };

      await addGroupExpense(groupId, payload);
      
      addToast({ message: 'Gasto agregado con éxito', type: 'success' });
      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      
      // Reload everything to get updated balances
      await loadData();
    } catch (err) {
      addToast({ message: 'Error al agregar gasto', type: 'error' });
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      addToast({ message: 'Selecciona un usuario', type: 'error' });
      return;
    }

    try {
      setSubmittingMember(true);
      // Call endpoint directly using apiClient or route since groupService doesn't have a direct wrapper
      await apiClient.post(`/groups/${groupId}/members`, { userId: selectedUserId });
      
      addToast({ message: 'Integrante agregado con éxito', type: 'success' });
      setShowMemberModal(false);
      setSelectedUserId('');
      
      // Reload group info
      await loadData();
    } catch (err) {
      addToast({ message: 'Error al agregar integrante', type: 'error' });
    } finally {
      setSubmittingMember(false);
    }
  };

  const toggleSplitMember = (memberId: string) => {
    if (expenseSplit.includes(memberId)) {
      setExpenseSplit(expenseSplit.filter(id => id !== memberId));
    } else {
      setExpenseSplit([...expenseSplit, memberId]);
    }
  };

  if (loading && !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-2 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-dm text-sm text-text-secondary">Cargando detalles del grupo...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <PageTransition className="min-h-screen bg-surface-2 pb-24">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/groups')}
          className="w-10 h-10 rounded-xl hover:bg-surface-3 flex items-center justify-center text-text-primary transition-colors"
          aria-label="Regresar a grupos"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="emoji">{group.emoji}</span>
            <h1 className="font-syne font-bold text-lg text-text-primary truncate">{group.name}</h1>
          </div>
          <p className="font-dm text-xs text-text-secondary truncate">
            {group.description || 'Gastos grupales divididos equitativamente'}
          </p>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
        {/* ─── Balances Summary & Debts ─── */}
        <div className="bg-surface border border-border rounded-3xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-dm text-xs text-text-secondary">Gasto total acumulado</p>
              <p className="font-mono font-bold text-2xl text-text-primary mt-0.5">
                {formatCurrency(group.totalExpenses)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={openMemberModal}
                variant="secondary"
                size="sm"
                icon={<UserPlus size={14} />}
              >
                Miembro
              </Button>
              <Button
                onClick={() => setShowExpenseModal(true)}
                size="sm"
                icon={<Plus size={14} />}
              >
                Gasto
              </Button>
            </div>
          </div>

          {/* Debts calculation */}
          {debts.length > 0 ? (
            <div className="border-t border-border pt-4 space-y-2.5">
              <h3 className="font-syne font-bold text-xs text-text-secondary flex items-center gap-1">
                <Landmark size={12} /> Liquidación recomendada
              </h3>
              <div className="grid gap-2">
                {debts.map((debt, index) => {
                  const isUserDebtor = debt.from === currentUser?.id;
                  const isUserCreditor = debt.to === currentUser?.id;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-dm ${
                        isUserDebtor 
                          ? 'bg-red-50/50 border-red-100 text-red-700' 
                          : isUserCreditor 
                          ? 'bg-green-50/50 border-green-100 text-success' 
                          : 'bg-surface-2 border-border text-text-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{debt.fromName}</span>
                        <span className="text-[10px] opacity-75">paga a</span>
                        <span className="font-semibold">{debt.toName}</span>
                      </div>
                      <div className="font-mono font-bold text-sm">
                        {formatCurrency(debt.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-t border-border pt-4 text-center py-2">
              <p className="font-dm text-xs text-text-secondary">🎉 Todos están al corriente, ¡nadie debe nada!</p>
            </div>
          )}
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 pb-3 font-syne font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            <FileText size={16} />
            Gastos ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 pb-3 font-syne font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary'
            }`}
          >
            <Users size={16} />
            Integrantes ({group.members.length})
          </button>
        </div>

        {/* ─── Tab Contents ─── */}
        <AnimatePresence mode="wait">
          {activeTab === 'expenses' ? (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {expenses.length === 0 ? (
                <div className="text-center py-12 bg-surface border border-border rounded-3xl">
                  <p className="font-dm text-sm text-text-secondary">No hay gastos registrados en este grupo.</p>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="mt-3 text-primary font-dm text-xs font-semibold hover:underline"
                  >
                    Agregar el primer gasto
                  </button>
                </div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-primary">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <h4 className="font-syne font-bold text-sm text-text-primary">{exp.title}</h4>
                        <div className="flex items-center gap-2 mt-1 font-dm text-[11px] text-text-secondary">
                          <span>Pagado por <strong className="text-text-primary font-medium">{exp.paidByName || 'Miembro'}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Calendar size={10} /> {formatRelativeDate(exp.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-text-primary">
                        {formatCurrency(exp.amount)}
                      </p>
                      <p className="font-dm text-[10px] text-text-secondary mt-0.5">
                        Dividido entre {exp.splitBetween.length}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-2.5"
            >
              {group.members.map((member) => {
                const isCurrentUser = member.userId === currentUser?.id;
                
                return (
                  <div
                    key={member.userId}
                    className="bg-surface border border-border rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-syne font-bold text-xs">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <span className="font-syne font-bold text-sm text-text-primary">
                          {member.name} {isCurrentUser && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md ml-1 font-dm">Tú</span>}
                        </span>
                        <p className="font-dm text-[10px] text-text-secondary mt-0.5">
                          Miembro desde el primer día
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-mono font-bold text-sm ${
                        member.balance > 0 
                          ? 'text-success' 
                          : member.balance < 0 
                          ? 'text-red-500' 
                          : 'text-text-secondary'
                      }`}>
                        {member.balance > 0 ? '+' : ''}{formatCurrency(member.balance)}
                      </p>
                      <p className="font-dm text-[10px] text-text-secondary mt-0.5">
                        {member.balance > 0 
                          ? 'le deben' 
                          : member.balance < 0 
                          ? 'debe' 
                          : 'al corriente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Modal: Nuevo Gasto ─── */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-syne font-bold text-base text-text-primary">Registrar Gasto Colectivo</h2>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4 font-dm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">¿Qué compraste? / Descripción</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supermercado, Cena del viernes, Gasolina"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Monto total ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-semibold text-sm">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary block">
                    Dividir entre quiénes: <span className="font-normal opacity-75">({expenseSplit.length} seleccionados)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                    {group.members.map(member => {
                      const isSelected = expenseSplit.includes(member.userId);
                      return (
                        <button
                          type="button"
                          key={member.userId}
                          onClick={() => toggleSplitMember(member.userId)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all ${
                            isSelected 
                              ? 'bg-primary/5 border-primary text-primary font-semibold' 
                              : 'bg-surface-2 border-border text-text-secondary'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                          }`}>
                            {isSelected && <Check size={10} />}
                          </div>
                          <span className="truncate">{member.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {expenseSplit.length > 0 && expenseAmount && Number(expenseAmount) > 0 && (
                  <div className="bg-surface-2 rounded-2xl p-3 text-center text-xs text-text-secondary border border-border font-mono">
                    Cada uno pagará:{' '}
                    <span className="font-bold text-text-primary">
                      {formatCurrency(Number(expenseAmount) / expenseSplit.length)}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={submittingExpense}
                    className="flex-1"
                  >
                    Guardar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Modal: Agregar Integrante ─── */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-syne font-bold text-base text-text-primary">Agregar Integrante</h2>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4 font-dm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Buscar y seleccionar usuario</label>
                  {loadingUsers ? (
                    <div className="py-4 text-center text-xs text-text-secondary">Cargando usuarios...</div>
                  ) : availableUsers.length === 0 ? (
                    <div className="py-4 text-center text-xs text-red-500">
                      No hay otros usuarios registrados en el sistema que no pertenezcan al grupo.
                    </div>
                  ) : (
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={submittingMember}
                    disabled={availableUsers.length === 0}
                    className="flex-1"
                  >
                    Invitar al Grupo
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
