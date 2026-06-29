'use client';
// Groups Page — lista de grupos con avatares apilados y detalle
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight, ChevronRight } from 'lucide-react';
import { PageTransition, containerVariants, itemVariants } from '@/components/layout/PageTransition';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { getGroups, calculateDebts } from '@/services/groupService';
import { formatCurrency, formatRelativeDate, getInitials, getIconForEmoji } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
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
function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const debts = calculateDebts(group);
  const userDebt = debts.find((d) => d.from === 'user_001');
  const userCredit = debts.find((d) => d.to === 'user_001');

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
        {/* Group icon */}
        {(() => {
          const GroupIcon = getIconForEmoji(group.emoji);
          return (
            <div
              className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center flex-shrink-0 text-primary"
              aria-hidden="true"
            >
              <GroupIcon size={22} className="text-primary" />
            </div>
          );
        })()}


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
function DebtOverview({ groups }: { groups: Group[] }) {
  let totalOwed = 0;
  let totalOwing = 0;

  groups.forEach((group) => {
    const debts = calculateDebts(group);
    debts.forEach((debt) => {
      if (debt.from === 'user_001') totalOwing += debt.amount;
      if (debt.to === 'user_001') totalOwed += debt.amount;
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => addToast({ message: 'Error cargando grupos', type: 'error' }))
      .finally(() => setIsLoading(false));
  }, [addToast]);

  return (
    <PageTransition className="min-h-screen bg-surface-2">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Grupos</h1>
          <p className="font-dm text-xs text-text-secondary">Gastos colaborativos</p>
        </div>
        <button
          onClick={() => router.push('/groups/new')}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl font-dm font-semibold text-sm hover:bg-primary-dark transition-colors"
          aria-label="Crear nuevo grupo"
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo
        </button>
      </header>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 md:py-6">
        {/* Debt overview */}
        {!isLoading && <DebtOverview groups={groups} />}

        {/* Groups list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <SkeletonCard key={i} lines={4} showAvatar />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-surface-2 flex items-center justify-center text-primary mx-auto mb-3 sm:mb-4"
              aria-hidden="true"
            >
              <Users size={32} className="text-primary" />
            </div>

            <h2 className="font-syne font-bold text-lg sm:text-xl text-text-primary mb-2">
              Sin grupos aún
            </h2>
            <p className="font-dm text-sm text-text-secondary mb-5 sm:mb-6 max-w-xs mx-auto">
              Crea un grupo para dividir gastos con amigos, roomies o en viajes.
            </p>
            <Button
              onClick={() => router.push('/groups/new')}
              icon={<Plus size={16} aria-hidden="true" />}
            >
              Crear primer grupo
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2 sm:space-y-3"
          >
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
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
              💡 Desliza los gastos para ver opciones de edición
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
