'use client';
// Groups Page — lista de grupos con avatares apilados y detalle + creación de grupos
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ChevronRight, X, Check } from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { getGroups, calculateDebts, createGroup } from '@/services/groupService';
import { getUsers } from '@/services/authService';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { Group } from '@/types/group.types';

// Stacked avatars component
function StackedAvatars({ members, max = 3 }: { members: Group['members']; max?: number }) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-2" aria-label={`${members.length} miembros`}>
      {visible.map((member, i) => (
        <div
          key={member.userId}
          className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white flex items-center justify-center text-white font-syne font-bold text-xs"
          style={{ zIndex: visible.length - i }}
          title={member.name}
          aria-label={member.name}
        >
          {getInitials(member.name)}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="w-7 h-7 rounded-full bg-surface-3 border-2 border-white flex items-center justify-center text-text-secondary font-dm font-bold text-xs"
          aria-label={`${remaining} más`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// Group card component
function GroupCard({ group, onClick, currentUserId }: { group: Group; onClick: () => void; currentUserId?: string }) {
  const debts = calculateDebts(group);
  const userDebt = debts.find((d) => d.from === currentUserId);
  const userCredit = debts.find((d) => d.to === currentUserId);

  return (
    <motion.button
      variants={itemVariants}
      className="w-full bg-surface rounded-2xl p-4 border border-border shadow-card text-left"
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0, 87, 255, 0.12)' }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Grupo ${group.name}`}
    >
      <div className="flex items-start gap-3">
        {/* Group emoji */}
        <div
          className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-2xl flex-shrink-0"
          aria-hidden="true"
        >
          {group.emoji}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-syne font-bold text-sm text-text-primary">{group.name}</h3>
            <ChevronRight size={16} className="text-text-secondary" aria-hidden="true" />
          </div>
          {group.description && (
            <p className="font-dm text-xs text-text-secondary truncate mt-0.5">
              {group.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <StackedAvatars members={group.members} />
            <div className="text-right">
              <p className="font-dm text-xs text-text-secondary">Total gastos</p>
              <p className="font-mono font-semibold text-sm text-text-primary">
                {formatCurrency(group.totalExpenses)}
              </p>
            </div>
          </div>

          {/* User balance in group */}
          {(userDebt || userCredit) && (
            <div
              className={`mt-3 px-3 py-1.5 rounded-xl text-xs font-dm font-semibold ${
                userDebt
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-success'
              }`}
            >
              {userDebt
                ? `Debes ${formatCurrency(userDebt.amount)} a ${userDebt.toName}`
                : `Te deben ${formatCurrency(userCredit!.amount)}`}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <p className="font-dm text-xs text-text-secondary">
          Última actividad: {formatRelativeDate(group.lastActivity)}
        </p>
        <div className="flex items-center gap-1 text-primary text-xs font-dm font-semibold">
          <Users size={12} aria-hidden="true" />
          {group.members.length} personas
        </div>
      </div>
    </motion.button>
  );
}

// Debt summary overview
function DebtOverview({ groups, currentUserId }: { groups: Group[]; currentUserId?: string }) {
  let totalOwed = 0;
  let totalOwing = 0;

  groups.forEach((group) => {
    const debts = calculateDebts(group);
    debts.forEach((debt) => {
      if (debt.from === currentUserId) totalOwing += debt.amount;
      if (debt.to === currentUserId) totalOwed += debt.amount;
    });
  });

  if (totalOwed === 0 && totalOwing === 0) return null;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3"
    >
      <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
        <p className="font-dm text-xs text-success mb-1">Te deben</p>
        <p className="font-mono font-bold text-lg text-success">
          {formatCurrency(totalOwed)}
        </p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
        <p className="font-dm text-xs text-red-500 mb-1">Debes</p>
        <p className="font-mono font-bold text-lg text-red-500">
          {formatCurrency(totalOwing)}
        </p>
      </div>
    </motion.div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = () => {
    setIsLoading(true);
    getGroups()
      .then(setGroups)
      .catch(() => addToast({ message: 'Error cargando grupos', type: 'error' }))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, [addToast]);

  const openModal = async () => {
    setShowCreateModal(true);
    try {
      const allUsers = await getUsers();
      setAvailableUsers(allUsers);
    } catch {
      addToast({ message: 'Error al cargar usuarios disponibles', type: 'error' });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      addToast({ message: 'Escribe el nombre del grupo', type: 'warning' });
      return;
    }

    try {
      setIsCreating(true);
      await createGroup({
        name: newGroupName,
        emoji: '👥',
        memberIds: selectedUserIds,
      });

      addToast({ message: 'Grupo creado con éxito', type: 'success' });
      setShowCreateModal(false);
      setNewGroupName('');
      setSelectedUserIds([]);
      fetchGroups();
    } catch {
      addToast({ message: 'Error al crear grupo', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(uid => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Grupos</h1>
          <p className="font-dm text-xs text-text-secondary">Gastos colaborativos</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-dm font-semibold text-sm hover:bg-primary-dark transition-colors"
          aria-label="Crear nuevo grupo"
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo
        </button>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Debt overview */}
        {!isLoading && <DebtOverview groups={groups} currentUserId={user?.id} />}

        {/* Groups list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <SkeletonCard key={i} lines={4} showAvatar />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 rounded-3xl bg-surface-2 flex items-center justify-center text-4xl mx-auto mb-4"
              aria-hidden="true"
            >
              🤝
            </div>
            <h2 className="font-syne font-bold text-lg text-text-primary mb-2">
              Sin grupos aún
            </h2>
            <p className="font-dm text-sm text-text-secondary mb-6 max-w-xs mx-auto">
              Crea un grupo para dividir gastos con amigos, roomies o en viajes.
            </p>
            <Button onClick={openModal} icon={<Plus size={18} />}>Crear primer grupo</Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={user?.id}
                onClick={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </motion.div>
        )}

        {/* Empty state tip */}
        {!isLoading && groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-4"
          >
            <p className="font-dm text-xs text-text-secondary">
              💡 Presiona un grupo para gestionar sus gastos compartidos
            </p>
          </motion.div>
        )}
      </div>

      {/* ─── Modal Crear Grupo ─── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-surface w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
                <h3 className="font-syne font-bold text-base text-text-primary">Crear nuevo grupo</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                    setSelectedUserIds([]);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-surface-3 flex items-center justify-center text-text-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label htmlFor="groupName" className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                    Nombre del grupo
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ej. Roomies Terán 🏠"
                    className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl font-dm text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-dm font-semibold text-text-secondary mb-1.5">
                    Seleccionar Integrantes
                  </label>
                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border bg-surface-2 max-h-48 overflow-y-auto">
                    {availableUsers.map((availableUser) => {
                      const isSelected = selectedUserIds.includes(availableUser.id);
                      return (
                        <button
                          key={availableUser.id}
                          type="button"
                          onClick={() => toggleSelectUser(availableUser.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center text-primary font-syne font-bold text-xs">
                              {getInitials(availableUser.name)}
                            </div>
                            <div>
                              <p className="font-dm font-semibold text-xs text-text-primary">{availableUser.name}</p>
                              <p className="font-dm text-[10px] text-text-secondary">{availableUser.email}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-border bg-surface'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" fullWidth loading={isCreating}>
                    Crear Grupo
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
