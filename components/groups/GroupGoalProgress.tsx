import React from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  groupId: string;
}

export function GroupGoalProgress({ groupId }: Props) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
        <Target size={32} />
      </div>
      <h3 className="font-syne font-bold text-lg text-text-primary">Metas de Ahorro Grupales</h3>
      <p className="font-dm text-sm text-text-secondary max-w-sm mx-auto">
        Aún no tienen ninguna meta compartida. Pueden juntar fondos para un viaje, comprar un regalo o un proyecto en común.
      </p>
      <Button className="mt-4" icon={<Target size={16} />}>Crear Meta Compartida</Button>
    </div>
  );
}
