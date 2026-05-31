/**
 * Navigation Component Controller
 * Sincroniza y resalta las pestañas activas según la URL actual.
 */

export const Navigation = {
  init() {
    const currentPath = window.location.pathname;
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    // 1. Manejar Sidebar Desktop
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-item');
    sidebarLinks.forEach(item => {
      const link = item.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href === filename || (filename === '' && href === 'index.html')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });

    // 2. Manejar Bottom Nav Mobile
    const bottomLinks = document.querySelectorAll('.bottom-nav .bottom-nav-item');
    bottomLinks.forEach(item => {
      const href = item.getAttribute('href');
      if (href === filename || (filename === '' && href === 'index.html')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    console.log('FinSense Navigation Inicializada para:', filename);
  }
};
