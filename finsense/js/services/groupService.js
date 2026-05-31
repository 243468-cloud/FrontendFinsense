import { helpers } from '../utils/helpers.js';

/**
 * GroupService (Capa de Servicio - Modo Colaborativo de Gasto)
 * Administra los grupos de gasto compartido, cuentas divididas y balances cruzados.
 */

const GROUP_EXPENSES_KEY = 'finsense_group_expenses';

const MEMBERS = [
  { id: 'm_kaled', name: 'Kaled (Tú)', avatar: '🦖', color: '#1A56DB' },
  { id: 'm_marco', name: 'Marco', avatar: '🦁', color: '#10B981' },
  { id: 'm_sofia', name: 'Sofía', avatar: '🦊', color: '#EC4899' },
  { id: 'm_valeria', name: 'Valeria', avatar: '🐼', color: '#F59E0B' }
];

const SEED_GROUP_EXPENSES = [
  {
    id: 'ge_1',
    description: 'Cena de Tacos en Terán',
    totalAmount: 480.00,
    paidBy: 'm_marco', // Pagado por Marco
    splitWith: ['m_kaled', 'm_marco', 'm_sofia', 'm_valeria'],
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // ayer
    breakdown: 'Split equitativo ($120 cada uno)'
  },
  {
    id: 'ge_2',
    description: 'Pozol y empanadas para el picnic',
    totalAmount: 300.00,
    paidBy: 'm_kaled', // Pagado por Kaled (Tú)
    splitWith: ['m_kaled', 'm_marco', 'm_sofia', 'm_valeria'],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    breakdown: 'Split equitativo ($75 cada uno)'
  },
  {
    id: 'ge_3',
    description: 'Colectivo / Taxi al Aeropuerto',
    totalAmount: 400.00,
    paidBy: 'm_sofia', // Pagada por Sofía
    splitWith: ['m_kaled', 'm_sofia'], // Solo Kaled y Sofía
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    breakdown: 'Split de 2 personas ($200 cada uno)'
  }
];

export const GroupService = {
  /**
   * Obtiene los miembros del grupo compartido
   */
  getMembers() {
    return MEMBERS;
  },

  /**
   * Obtiene los gastos compartidos del grupo
   */
  getGroupExpenses() {
    let data = localStorage.getItem(GROUP_EXPENSES_KEY);
    if (!data) {
      localStorage.setItem(GROUP_EXPENSES_KEY, JSON.stringify(SEED_GROUP_EXPENSES));
      return SEED_GROUP_EXPENSES;
    }
    return JSON.parse(data);
  },

  /**
   * Añade un nuevo gasto grupal y recalcula
   */
  addGroupExpense(expense) {
    const expenses = this.getGroupExpenses();
    const newGe = {
      id: helpers.generateUUID(),
      description: expense.description || 'Gasto Grupal',
      totalAmount: parseFloat(expense.totalAmount) || 0,
      paidBy: expense.paidBy || 'm_kaled',
      splitWith: expense.splitWith || MEMBERS.map(m => m.id),
      date: new Date().toISOString(),
      breakdown: `Split entre ${expense.splitWith ? expense.splitWith.length : MEMBERS.length} personas`
    };
    expenses.unshift(newGe);
    localStorage.setItem(GROUP_EXPENSES_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    return newGe;
  },

  /**
   * Calcula el balance cruzado simplificado ("Quién le debe a quién")
   * Devuelve saldos desde la perspectiva del usuario principal 'm_kaled'
   */
  getBalancesForUser() {
    const expenses = this.getGroupExpenses();
    const myId = 'm_kaled';
    
    // Inicializar deudas netas de Kaled con otros miembros: positivo = me deben, negativo = les debo
    const netBalances = {
      m_marco: 0,
      m_sofia: 0,
      m_valeria: 0
    };

    expenses.forEach(exp => {
      const payer = exp.paidBy;
      const splitList = exp.splitWith;
      const share = exp.totalAmount / splitList.length;

      // Si Kaled pagó
      if (payer === myId) {
        splitList.forEach(memberId => {
          if (memberId !== myId) {
            // Cada uno de ellos le debe su porción a Kaled
            netBalances[memberId] += share;
          }
        });
      } else {
        // Si alguien más pagó y Kaled está incluido en el split
        if (splitList.includes(myId)) {
          // Kaled le debe su porción al pagador
          netBalances[payer] -= share;
        }
      }
    });

    // Formatear saldos cruzados con detalle (para las flip-cards)
    return Object.keys(netBalances).map(memberId => {
      const member = MEMBERS.find(m => m.id === memberId);
      const balanceVal = netBalances[memberId];
      
      let relationType = 'neutral'; // 'debes', 'te_debe', 'saldado'
      let text = 'Al corriente';
      let details = [];

      if (balanceVal > 0) {
        relationType = 'te_debe';
        text = `${member.name} te debe`;
      } else if (balanceVal < 0) {
        relationType = 'debes';
        text = `Le debes a ${member.name}`;
      }

      // Generar detalles específicos de deudas para el "Back of the Flip Card"
      expenses.forEach(exp => {
        const share = exp.totalAmount / exp.splitWith.length;
        if (exp.paidBy === myId && exp.splitWith.includes(memberId)) {
          details.push({
            desc: exp.description,
            amount: share,
            type: 'cobro',
            label: `Pagas tú, su parte: ${helpers.formatCurrency(share)}`
          });
        } else if (exp.paidBy === memberId && exp.splitWith.includes(myId)) {
          details.push({
            desc: exp.description,
            amount: share,
            type: 'deuda',
            label: `Paga ${member.name}, tu parte: ${helpers.formatCurrency(share)}`
          });
        }
      });

      return {
        member,
        value: Math.abs(balanceVal),
        relationType,
        text,
        details: details.slice(0, 3) // Mostrar máximo 3 detalles
      };
    });
  }
};
