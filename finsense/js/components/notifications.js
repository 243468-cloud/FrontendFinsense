/**
 * Notifications Component Controller
 * Permite disparar notificaciones toast premium en la aplicación con animaciones fluidas.
 */

export const NotificationSystem = {
  /**
   * Muestra una notificación toast in-app
   * @param {string} title - Título de la notificación
   * @param {string} message - Cuerpo del mensaje
   * @param {string} type - Tipo de notificación ('success', 'warning', 'danger', 'info')
   */
  show(title, message, type = 'success') {
    // Evitar acumulaciones en pantallas pequeñas
    const existing = document.querySelector('.notification-toast');
    if (existing) {
      existing.remove();
    }

    // Definir color e ícono según tipo
    let icon = '🔔';
    let borderColor = 'var(--color-primary)';
    
    if (type === 'success') {
      icon = '🏆';
      borderColor = 'var(--color-success)';
    } else if (type === 'warning') {
      icon = '⚠️';
      borderColor = 'var(--color-warning)';
    } else if (type === 'danger') {
      icon = '🚨';
      borderColor = 'var(--color-danger)';
    } else if (type === 'info') {
      icon = '💡';
      borderColor = 'var(--color-accent)';
    }

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = 'notification-toast animate-fade-up';
    toast.style.borderLeft = `4px solid ${borderColor}`;
    toast.innerHTML = `
      <div style="font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
        ${icon}
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.1rem; max-width: 250px;">
        <h4 style="font-size: 0.9rem; font-family: var(--font-title); color: var(--color-text);">${title}</h4>
        <p style="font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.3;">${message}</p>
      </div>
      <div class="notification-progress" style="background: ${borderColor}"></div>
    `;

    document.body.appendChild(toast);

    // Auto-eliminar después de 4 segundos (coincidiendo con shrink)
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }
};

// Escuchar eventos globales de desbloqueo de insignias
window.addEventListener('finsense_badge_unlocked', (e) => {
  const badges = e.detail;
  const newlyUnlocked = badges.find(b => b.unlocked && (Date.now() - new Date(b.unlockedAt).getTime() < 5000));
  
  if (newlyUnlocked) {
    NotificationSystem.show(
      '¡Insignia Desbloqueada! 🏆',
      `Felicidades, ganaste el logro "${newlyUnlocked.title}" (${newlyUnlocked.icon}).`,
      'success'
    );
  }
});
