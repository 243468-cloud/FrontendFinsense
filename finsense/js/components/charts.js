/**
 * Charts Component Controller
 * Maneja la actualización de gráficos SVG y barras de progreso basándose en los datos de los servicios.
 */

export const Charts = {
  /**
   * Actualiza el gráfico de dona del balance en el Dashboard
   * @param {number} ingresos - Total de ingresos
   * @param {number} gastos - Total de gastos
   */
  updateBalanceDonut(ingresos, gastos) {
    const total = ingresos + gastos;
    const donutCircle = document.getElementById('balance-donut-segment');
    if (!donutCircle) return;

    if (total === 0) {
      // Si no hay transacciones, poner 50/50 o gris
      donutCircle.style.strokeDashoffset = '283';
      return;
    }

    const expenseRatio = gastos / total;
    const circumference = 283; // 2 * PI * r (r=45)
    
    // El offset determina cuánto del círculo se cubre (en sentido antihorario o similar)
    // Queremos que represente el porcentaje de gastos en rojo/azul
    const targetOffset = circumference - (expenseRatio * circumference);
    
    donutCircle.style.setProperty('--target-offset', targetOffset);
    donutCircle.style.strokeDashoffset = targetOffset;
  },

  /**
   * Inicializa círculos de progreso SVG radiales (utilizados en metas.html)
   */
  initRadialProgress() {
    const progressCircles = document.querySelectorAll('.radial-progress-circle');
    progressCircles.forEach(circle => {
      const percent = parseFloat(circle.getAttribute('data-percent')) || 0;
      const circumference = 283; // 2 * PI * r (r=45)
      const targetOffset = circumference - (percent / 100 * circumference);
      
      circle.style.setProperty('--target-offset', targetOffset);
      circle.style.strokeDashoffset = targetOffset;
    });
  },

  /**
   * Actualiza barras de progreso lineales simples
   */
  initLinealProgress() {
    const progressFills = document.querySelectorAll('.progress-bar-fill');
    progressFills.forEach(fill => {
      const percent = fill.getAttribute('data-percent') || '0%';
      fill.style.setProperty('--target-width', percent);
      fill.style.width = percent;
    });
  },

  /**
   * Dibuja un gráfico de barras semanal interactivo en SVG/HTML
   * @param {string} containerId - ID del contenedor HTML
   * @param {Array} weeklyData - Array de objetos {label: 'Lun', amount: 150}
   */
  renderWeeklyBarChart(containerId, weeklyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!weeklyData || weeklyData.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 2rem;">Sin datos de gastos esta semana.</p>';
      return;
    }

    const maxAmount = Math.max(...weeklyData.map(d => d.amount), 100);

    const barsHTML = weeklyData.map(d => {
      const heightPercent = (d.amount / maxAmount) * 100;
      const height = d.amount > 0 ? Math.max(6, heightPercent) : 0;
      
      return `
        <div class="weekly-bar-col" style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; position: relative;">
          <!-- Tooltip flotante en hover -->
          <div class="weekly-bar-tooltip" style="position: absolute; bottom: calc(${height}% + 10px); background: var(--color-primary-dark); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-xs); font-size: 0.65rem; font-family: var(--font-numeric); opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(5px); white-space: nowrap; z-index: 10; box-shadow: var(--shadow-sm);">
            $${d.amount.toFixed(2)}
          </div>
          
          <!-- Barra -->
          <div class="weekly-bar-fill animate-fade-up" style="width: 18px; height: ${height}%; background: linear-gradient(180deg, var(--color-accent), var(--color-primary)); border-radius: 4px 4px 0 0; transition: height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer;"
               onmouseenter="this.previousElementSibling.style.opacity='1'; this.previousElementSibling.style.transform='translateY(0)';"
               onmouseleave="this.previousElementSibling.style.opacity='0'; this.previousElementSibling.style.transform='translateY(5px)';"></div>
          
          <!-- Etiqueta del día -->
          <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-weight: 700; font-family: var(--font-title);">${d.label}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="weekly-chart-wrapper" style="display: flex; align-items: flex-end; height: 140px; justify-content: space-between; gap: 0.5rem; padding: 1rem 0.5rem 0 0.5rem;">
        ${barsHTML}
      </div>
    `;
  },

  /**
   * Dibuja un gráfico de barras mensual interactivo en SVG/HTML
   * @param {string} containerId - ID del contenedor HTML
   * @param {Array} monthlyData - Array de objetos {label: 'Ene', amount: 1500}
   */
  renderMonthlyBarChart(containerId, monthlyData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!monthlyData || monthlyData.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 2rem;">Sin datos de gastos en los últimos meses.</p>';
      return;
    }

    const maxAmount = Math.max(...monthlyData.map(d => d.amount), 100);

    const barsHTML = monthlyData.map(d => {
      const heightPercent = (d.amount / maxAmount) * 100;
      const height = d.amount > 0 ? Math.max(6, heightPercent) : 0;
      
      return `
        <div class="weekly-bar-col" style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; position: relative;">
          <!-- Tooltip flotante en hover -->
          <div class="weekly-bar-tooltip" style="position: absolute; bottom: calc(${height}% + 10px); background: var(--color-primary-dark); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-xs); font-size: 0.65rem; font-family: var(--font-numeric); opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(5px); white-space: nowrap; z-index: 10; box-shadow: var(--shadow-sm);">
            $${d.amount.toFixed(2)}
          </div>
          
          <!-- Barra -->
          <div class="weekly-bar-fill animate-fade-up" style="width: 22px; height: ${height}%; background: linear-gradient(180deg, var(--color-primary-light), var(--color-primary-dark)); border-radius: 4px 4px 0 0; transition: height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer;"
               onmouseenter="this.previousElementSibling.style.opacity='1'; this.previousElementSibling.style.transform='translateY(0)';"
               onmouseleave="this.previousElementSibling.style.opacity='0'; this.previousElementSibling.style.transform='translateY(5px)';"></div>
          
          <!-- Etiqueta del mes -->
          <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-weight: 700; font-family: var(--font-title);">${d.label}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="weekly-chart-wrapper" style="display: flex; align-items: flex-end; height: 140px; justify-content: space-between; gap: 0.5rem; padding: 1rem 0.5rem 0 0.5rem;">
        ${barsHTML}
      </div>
    `;
  }
};
