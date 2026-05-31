import { helpers } from '../utils/helpers.js';
import { AuthService } from './authService.js';

/**
 * TransactionService (Capa de Servicio - Gastos/Ingresos)
 * Administra el almacenamiento y las operaciones de transacciones financieras.
 */

const STORAGE_KEY = 'finsense_transactions';

const SEED_TRANSACTIONS = [
  {
    id: 'fs_seed_1',
    description: 'Pozol de Cacao y Empanadas',
    amount: 85.00,
    type: 'gasto', // 'gasto' o 'ingreso'
    category: 'comida', // 'comida', 'renta', 'transporte', 'servicios', 'diversion', 'ingresos'
    date: new Date().toISOString(),
    note: 'En el Parque de la Marimba con los amigos'
  },
  {
    id: 'fs_seed_2',
    description: 'Beca Benito Juárez / Pago Quincenal',
    amount: 3200.00,
    type: 'ingreso',
    category: 'ingresos',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // ayer
    note: 'Depósito mensual'
  },
  {
    id: 'fs_seed_3',
    description: 'Renta Mensual Cuarto Moctezuma',
    amount: 1800.00,
    type: 'gasto',
    category: 'renta',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Cerca de la UNICACH'
  },
  {
    id: 'fs_seed_4',
    description: 'Pasajes de Colectivo (Ruta 125 y Chiapa de Corzo)',
    amount: 120.00,
    type: 'gasto',
    category: 'transporte',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Transporte semanal para ir a estudiar/trabajar'
  },
  {
    id: 'fs_seed_5',
    description: 'Salida a Plaza Ámbar',
    amount: 450.00,
    type: 'gasto',
    category: 'diversion',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    note: 'Cine y cena rápida'
  }
];

export const TransactionService = {
  /**
   * Obtiene todas las transacciones almacenadas o inicializa con datos de semilla
   */
  getTransactions() {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
      return SEED_TRANSACTIONS;
    }
    return JSON.parse(data);
  },

  /**
   * Agrega una nueva transacción
   * @param {Object} transaction - Datos de la transacción (description, amount, type, category, note)
   */
  addTransaction(transaction) {
    const transactions = this.getTransactions();
    const newTx = {
      id: helpers.generateUUID(),
      description: transaction.description || 'Transacción sin nombre',
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type || 'gasto',
      category: transaction.category || 'otros',
      date: transaction.date || new Date().toISOString(),
      note: transaction.note || ''
    };
    transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    
    // Disparar un evento para notificar cambios en la aplicación
    AuthService.addXP(15);
    window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    return newTx;
  },

  /**
   * Elimina una transacción por ID
   * @param {string} id - ID de la transacción
   */
  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(tx => tx.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent('finsense_data_changed'));
  },

  /**
   * Actualiza una transacción existente por ID
   * @param {string} id - ID de la transacción
   * @param {Object} updatedData - Nuevos datos (description, amount, type, category, note)
   */
  updateTransaction(id, updatedData) {
    let transactions = this.getTransactions();
    const index = transactions.findIndex(tx => tx.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        description: updatedData.description || transactions[index].description,
        amount: parseFloat(updatedData.amount) || transactions[index].amount,
        type: updatedData.type || transactions[index].type,
        category: updatedData.category || transactions[index].category,
        note: updatedData.note !== undefined ? updatedData.note : transactions[index].note
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      AuthService.addXP(5);
      window.dispatchEvent(new CustomEvent('finsense_data_changed'));
      return transactions[index];
    }
    return null;
  },

  /**
   * Obtiene la suma de gastos por día de los últimos 7 días
   */
  getWeeklySpending() {
    const transactions = this.getTransactions();
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Generar los últimos 7 días con fecha
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      last7Days.push({
        dateStr: d.toDateString(),
        dayLabel: days[d.getDay()],
        amount: 0
      });
    }

    transactions.forEach(tx => {
      if (tx.type === 'gasto') {
        const txDate = new Date(tx.date);
        txDate.setHours(0,0,0,0);
        const txDateStr = txDate.toDateString();
        
        const dayObj = last7Days.find(day => day.dateStr === txDateStr);
        if (dayObj) {
          dayObj.amount += tx.amount;
        }
      }
    });

    return last7Days.map(d => ({
      label: d.dayLabel,
      amount: d.amount
    }));
  },

  /**
   * Obtiene la suma de gastos agrupados por mes de los últimos 6 meses
   */
  getMonthlySpending() {
    const transactions = this.getTransactions();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyData = [];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthlyData.push({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        label: `${months[d.getMonth()]}`,
        amount: 0
      });
    }

    transactions.forEach(tx => {
      if (tx.type === 'gasto') {
        const txDate = new Date(tx.date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();

        const monthObj = monthlyData.find(m => m.year === txYear && m.monthIdx === txMonth);
        if (monthObj) {
          monthObj.amount += tx.amount;
        }
      }
    });

    return monthlyData.map(m => ({
      label: m.label,
      amount: m.amount
    }));
  },

  /**
   * Obtiene el resumen mensual (Ingresos, Gastos, Balance, etc.)
   */
  getMonthlySummary() {
    const transactions = this.getTransactions();
    let ingresos = 0;
    let gastos = 0;

    transactions.forEach(tx => {
      // Filtrar solo las de este mes/año (en una app real)
      // Para esta maqueta sumaremos todas las registradas
      if (tx.type === 'ingreso') {
        ingresos += tx.amount;
      } else {
        gastos += tx.amount;
      }
    });

    const balance = ingresos - gastos;
    const percentSpent = ingresos > 0 ? (gastos / ingresos) * 100 : 0;

    return {
      ingresos,
      gastos,
      balance,
      percentSpent: Math.min(100, Math.max(0, percentSpent))
    };
  },

  /**
   * Obtiene la suma de gastos por categoría
   */
  getExpensesByCategory() {
    const transactions = this.getTransactions();
    const categories = {
      comida: 0,
      renta: 0,
      transporte: 0,
      servicios: 0,
      diversion: 0,
      otros: 0
    };

    transactions.forEach(tx => {
      if (tx.type === 'gasto') {
        const cat = categories[tx.category] !== undefined ? tx.category : 'otros';
        categories[cat] += tx.amount;
      }
    });

    return categories;
  }
};
