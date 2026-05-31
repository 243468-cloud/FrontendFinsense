import { helpers } from '../utils/helpers.js';

/**
 * GoalService (Capa de Servicio - Metas Ahorro, Rachas e Insignias)
 * Administra el sistema de gamificación de economía personal.
 */

const GOALS_STORAGE_KEY = 'finsense_goals';
const STREAK_STORAGE_KEY = 'finsense_streak';

const SEED_GOALS = [
  {
    id: 'g_1',
    title: 'Viaje al Cañón del Sumidero y Palenque',
    target: 2500.00,
    current: 1800.00,
    category: 'viajes',
    deadline: '2026-07-15'
  },
  {
    id: 'g_2',
    title: 'Laptop UNICACH / Tec Tuxtla',
    target: 14000.00,
    current: 8400.00,
    category: 'educacion',
    deadline: '2026-09-01'
  },
  {
    id: 'g_3',
    title: 'Fondo de Pozol y Empanadas',
    target: 400.00,
    current: 400.00, // Completada
    category: 'comida',
    deadline: '2026-06-10'
  }
];

const SEED_CHALLENGES = [
  {
    id: 'c_1',
    title: 'Racha Zoque',
    description: 'Registra tus gastos por 5 días consecutivos.',
    progress: 4,
    target: 5,
    points: 150,
    timeLeft: '2 días'
  },
  {
    id: 'c_2',
    title: 'Pozol en Casa',
    description: 'Reduce a menos de $150 tu gasto semanal de comida fuera.',
    progress: 120, // gastado 120 de 150 max
    target: 150,
    points: 100,
    type: 'limite',
    timeLeft: '4 días'
  },
  {
    id: 'c_3',
    title: 'Ahorro Colectivo',
    description: 'Completa un pago compartido con tus amigos del grupo.',
    progress: 1,
    target: 1, // Completado
    points: 200,
    timeLeft: 'Terminado'
  }
];

const SEED_BADGES = [
  {
    id: 'b_1',
    title: 'Pozol Lover',
    description: 'Registra tu primera transacción relacionada con comida típica.',
    icon: '🥤',
    unlocked: true,
    unlockedAt: '2026-05-25'
  },
  {
    id: 'b_2',
    title: 'Ahorrador Conejo',
    description: 'Llega al 50% de progreso en cualquier meta de ahorro activa.',
    icon: '🐰', // Conejos es el gentilicio popular de Tuxtla
    unlocked: true,
    unlockedAt: '2026-05-28'
  },
  {
    id: 'b_3',
    title: 'Fraylescano Pro',
    description: 'Mantén una racha de registro de 10 días seguidos.',
    icon: '🌽',
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 'b_4',
    title: 'Héroe del Cañón',
    description: 'Completa exitosamente una meta de ahorro de más de $2,000 MXN.',
    icon: '⛰️',
    unlocked: false,
    unlockedAt: null
  }
];

export const GoalService = {
  /**
   * Obtiene la lista de metas de ahorro activas
   */
  getGoals() {
    let data = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(SEED_GOALS));
      return SEED_GOALS;
    }
    return JSON.parse(data);
  },

  /**
   * Crea una nueva meta de ahorro
   * @param {Object} goal - Datos de la meta
   */
  addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      id: helpers.generateUUID(),
      title: goal.title || 'Nueva Meta',
      target: parseFloat(goal.target) || 100,
      current: parseFloat(goal.current) || 0,
      category: goal.category || 'otros',
      deadline: goal.deadline || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
    goals.push(newGoal);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    return newGoal;
  },

  /**
   * Registra un depósito/ahorro en una meta existente
   */
  addFundsToGoal(id, amount) {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx !== -1) {
      goals[idx].current = Math.min(goals[idx].target, goals[idx].current + parseFloat(amount));
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      
      // Validar si desbloquea insignias al completar
      this.checkBadgeUnlocks();

      window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    }
  },

  /**
   * Obtiene la racha de días de registro
   */
  getStreak() {
    let streak = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!streak) {
      // Por defecto simulamos una racha bonita de 4 días
      const defaultStreak = { count: 4, lastUpdate: new Date().toISOString() };
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(defaultStreak));
      return defaultStreak;
    }
    return JSON.parse(streak);
  },

  /**
   * Incrementa la racha (se llama automáticamente al agregar una transacción)
   */
  incrementStreak() {
    const streak = this.getStreak();
    const todayStr = new Date().toDateString();
    const lastUpdateDate = new Date(streak.lastUpdate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastUpdateDate.toDateString() === todayStr) {
      // Ya registró hoy, no incrementa pero mantiene
      return streak;
    } else if (lastUpdateDate.toDateString() === yesterday.toDateString()) {
      // Registró ayer, incrementa racha
      streak.count += 1;
    } else {
      // Se rompió la racha, reinicia en 1
      streak.count = 1;
    }

    streak.lastUpdate = new Date().toISOString();
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
    this.checkBadgeUnlocks();
    window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    return streak;
  },

  /**
   * Obtiene los desafíos semanales
   */
  getChallenges() {
    return SEED_CHALLENGES;
  },

  /**
   * Obtiene todas las insignias y su estado
   */
  getBadges() {
    let badges = localStorage.getItem('finsense_badges');
    if (!badges) {
      localStorage.setItem('finsense_badges', JSON.stringify(SEED_BADGES));
      return SEED_BADGES;
    }
    return JSON.parse(badges);
  },

  /**
   * Verifica y desbloquea insignias basadas en el estado del usuario
   */
  checkBadgeUnlocks() {
    const goals = this.getGoals();
    const streak = this.getStreak();
    let badges = this.getBadges();
    let updated = false;

    // Desbloquear héroe del cañón si hay metas completadas de más de 2000
    badges.forEach(b => {
      if (!b.unlocked) {
        if (b.id === 'b_4') {
          const finishedBigGoal = goals.some(g => g.target >= 2000 && g.current >= g.target);
          if (finishedBigGoal) {
            b.unlocked = true;
            b.unlockedAt = new Date().toISOString();
            updated = true;
          }
        }
        if (b.id === 'b_3' && streak.count >= 10) {
          b.unlocked = true;
          b.unlockedAt = new Date().toISOString();
          updated = true;
        }
      }
    });

    if (updated) {
      localStorage.setItem('finsense_badges', JSON.stringify(badges));
      // Disparar evento para que la UI notifique el desbloqueo
      window.dispatchEvent(new CustomEvent('finsense_badge_unlocked', { detail: badges }));
    }
  }
};
