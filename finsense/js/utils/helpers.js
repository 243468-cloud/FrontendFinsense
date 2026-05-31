/**
 * FinSense Helpers & Utilities
 * Contiene funciones comunes de formateo y generación de datos.
 */

export const helpers = {
  /**
   * Formatea un número como moneda mexicana (MXN)
   * @param {number} value - El monto numérico
   * @returns {string} - Cadena formateada
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  },

  /**
   * Formatea una fecha para visualización amigable
   * @param {string|Date} dateVal - Fecha
   * @returns {string} - Fecha formateada (ej. "30 May, 2026")
   */
  formatDate(dateVal) {
    const date = new Date(dateVal);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Obtiene una fecha relativa (ej. "Hoy", "Ayer", o fecha estándar)
   * @param {string|Date} dateVal - Fecha
   * @returns {string} - Cadena de fecha relativa
   */
  getRelativeDate(dateVal) {
    const date = new Date(dateVal);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return this.formatDate(dateVal);
    }
  },

  /**
   * Genera un ID único aleatorio
   * @returns {string} - ID generado
   */
  generateUUID() {
    return 'fs_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Anima un contador numérico en un elemento de texto
   * @param {HTMLElement} element - El elemento HTML donde renderizar el texto
   * @param {number} start - Valor inicial
   * @param {number} end - Valor final
   * @param {number} duration - Duración en milisegundos
   */
  animateCount(element, start, end, duration = 800) {
    if (!element) return;
    const isNegative = end < 0;
    const absoluteEnd = Math.abs(end);
    const absoluteStart = Math.abs(start);
    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = progress * (absoluteEnd - absoluteStart) + absoluteStart;
      
      element.textContent = (isNegative ? '-' : '') + this.formatCurrency(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = this.formatCurrency(end);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Exporta transacciones en formato CSV y descarga el archivo
   * @param {Array} transactions - Arreglo de transacciones
   */
  exportToCSV(transactions) {
    if (!transactions || transactions.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Fecha,Descripcion,Monto,Tipo,Categoria,Nota\n';

    transactions.forEach(tx => {
      const row = [
        tx.id,
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.type,
        tx.category,
        `"${(tx.note || '').replace(/"/g, '""')}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinSense_Transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
