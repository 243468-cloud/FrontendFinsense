import { TransactionService } from './transactionService.js';

/**
 * BenchmarkService (Capa de Servicio - Comparativa Local Tuxtla Gutiérrez)
 * Mide el gasto del usuario comparado con el promedio de jóvenes de 18-35 años en la ciudad.
 */

// Promedios mensuales típicos en Tuxtla Gutiérrez para un estudiante/joven profesional
const TUXTLA_MONTHLY_AVERAGES = {
  comida: 1200.00,       // Tacos, pozol, despensa en Chedraui/Mercado de los Ancianos
  renta: 2200.00,        // Renta compartida en Moctezuma, Terán o Centro
  transporte: 600.00,    // Colectivos locales ($8.50 por viaje) o taxi ocasional
  diversion: 800.00,     // Salidas en la Calzada de las Personas Ilustres, Terán o antros
  otros: 500.00          // Imprevistos
};

export const BenchmarkService = {
  /**
   * Obtiene los promedios mensuales de Tuxtla
   */
  getCityAverages() {
    return TUXTLA_MONTHLY_AVERAGES;
  },

  /**
   * Obtiene la comparativa detallada por categoría entre el usuario y la ciudad
   */
  getComparison() {
    const userExpenses = TransactionService.getExpensesByCategory();
    const comparison = [];

    Object.keys(TUXTLA_MONTHLY_AVERAGES).forEach(category => {
      const userVal = userExpenses[category] || 0;
      const cityVal = TUXTLA_MONTHLY_AVERAGES[category];
      const differencePercent = cityVal > 0 ? ((userVal - cityVal) / cityVal) * 100 : 0;
      
      let status = 'bueno'; // 'bueno' (bajo promedio), 'medio' (en el promedio), 'alerta' (excedido)
      let message = '¡Vas súper bien!';
      
      if (differencePercent > 15) {
        status = 'alerta';
        message = 'Te has excedido del promedio local.';
      } else if (differencePercent < -15) {
        status = 'bueno';
        message = '¡Ahorrador estrella! Muy por debajo del promedio local.';
      } else {
        status = 'medio';
        message = 'Te mantienes en el promedio general de Tuxtla.';
      }

      comparison.push({
        category,
        userValue: userVal,
        cityValue: cityVal,
        differencePercent: Math.round(differencePercent),
        status,
        message
      });
    });

    return comparison;
  },

  /**
   * Obtiene el puntaje de benchmark local general (0 a 100)
   */
  getGeneralBenchmarkScore() {
    const comparison = this.getComparison();
    let exceededCategories = 0;

    comparison.forEach(c => {
      if (c.status === 'alerta') exceededCategories++;
    });

    // Score base 100. Restamos 20 puntos por cada categoría excedida
    return Math.max(20, 100 - (exceededCategories * 20));
  }
};
