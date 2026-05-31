import { Navigation } from './components/navigation.js';
import { Charts } from './components/charts.js';
import { NotificationSystem } from './components/notifications.js';
import { TransactionService } from './services/transactionService.js';
import { BenchmarkService } from './services/benchmarkService.js';
import { GoalService } from './services/goalService.js';
import { GroupService } from './services/groupService.js';
import { AuthService } from './services/authService.js';
import { helpers } from './utils/helpers.js';

/**
 * FinSense App Orchestrator
 * Controla la inicialización de la app y orquesta las vistas modulares.
 */

const App = {
  init() {
    console.log('⚡ FinSense PWA Inicializando Capa SOA con Autenticación...');
    
    // 1. Inicializar navegación global
    Navigation.init();
    
    // 2. Ruta e inicialización de vista
    this.routeView();

    // 3. Escuchar cambios de datos reactivos para actualizar componentes
    window.addEventListener('finsense_data_changed', () => {
      console.log('🔄 Cambios detectados en FinSense Services. Sincronizando UI...');
      this.routeView();
    });

    // 4. Escuchar cambios de autenticación
    window.addEventListener('finsense_auth_changed', () => {
      console.log('🔑 Estado de sesión cambiado. Redirigiendo...');
      this.routeView();
    });

    // 5. Registrar eventos globales
    this.bindGlobalEvents();
  },

  routeView() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    // Proteger páginas privadas
    const privatePages = ['dashboard.html', 'registro.html', 'metas.html', 'grupos.html', 'perfil.html'];
    const isPrivate = privatePages.includes(pageName);
    
    if (isPrivate && !AuthService.isAuthenticated()) {
      console.log('🔒 Acceso privado denegado. Redirigiendo a login.html...');
      window.location.href = 'login.html';
      return;
    }

    // Cargar perfil dinámico en sidebar / bottom-nav de páginas privadas
    if (isPrivate && AuthService.isAuthenticated()) {
      this.updateSidebarAndNavbar(AuthService.getCurrentUser());
    }

    // Enrutador de lógica específica por página
    if (pageName === 'login.html') {
      this.loadLogin();
    } else if (pageName === 'perfil.html') {
      this.loadPerfil();
    } else if (pageName === 'dashboard.html') {
      this.loadDashboard();
    } else if (pageName === 'registro.html') {
      this.loadRegistro();
    } else if (pageName === 'metas.html') {
      this.loadMetas();
    } else if (pageName === 'grupos.html') {
      this.loadGrupos();
    }
  },

  /**
   * Sincroniza dinámicamente los datos del usuario en la barra lateral y de navegación
   */
  updateSidebarAndNavbar(user) {
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarCity = document.getElementById('sidebar-user-city');

    if (sidebarAvatar) {
      sidebarAvatar.textContent = user.avatar;
      sidebarAvatar.style.backgroundColor = user.color || 'var(--color-primary)';
    }
    if (sidebarName) {
      sidebarName.textContent = `${user.username} (Tú)`;
    }
    if (sidebarCity) {
      sidebarCity.textContent = user.city;
    }
  },

  bindGlobalEvents() {
    // Escuchar botón flotante FAB de añadir transacción grupal
    const addGroupBtn = document.getElementById('fab-add-group-expense');
    if (addGroupBtn) {
      addGroupBtn.addEventListener('click', () => {
        NotificationSystem.show('Nuevo Gasto Grupal', 'Ingresa los detalles del gasto compartido en Terán.', 'info');
      });
    }
  },

  /* ==========================================
     LÓGICA DE INICIO DE SESIÓN / REGISTRO
     ========================================== */
  loadLogin() {
    console.log('🔑 Cargando Formulario de Acceso...');
    
    // Si ya está logueado, enviar al dashboard
    if (AuthService.isAuthenticated()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const btnLogin = document.getElementById('btn-toggle-login');
    const btnRegister = document.getElementById('btn-toggle-register');
    const slider = document.getElementById('auth-slider');
    const loginForm = document.getElementById('login-form-submit');
    const registerForm = document.getElementById('register-form-submit');
    const welcomeMsg = document.getElementById('auth-welcome-message');

    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');

    const showRegister = () => {
      btnLogin.classList.remove('active');
      btnRegister.classList.add('active');
      slider.style.transform = 'translateX(100%)';
      slider.style.background = 'var(--color-accent)';
      
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      welcomeMsg.textContent = 'Crea tu cuenta de ahorro y únete a la racha 🌶️';
    };

    const showLogin = () => {
      btnRegister.classList.remove('active');
      btnLogin.classList.add('active');
      slider.style.transform = 'translateX(0)';
      slider.style.background = 'var(--color-primary)';
      
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      welcomeMsg.textContent = 'Gestiona tu dinero con sabor local de Tuxtla.';
    };

    if (btnRegister) btnRegister.addEventListener('click', showRegister);
    if (btnLogin) btnLogin.addEventListener('click', showLogin);
    if (linkToRegister) linkToRegister.addEventListener('click', showRegister);
    if (linkToLogin) linkToLogin.addEventListener('click', showLogin);

    // Formulario Iniciar Sesión Submit
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        try {
          AuthService.login(email, pass);
          NotificationSystem.show('¡Bienvenido! 👋', 'Sesión iniciada con éxito.', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } catch (error) {
          NotificationSystem.show('Fallo de Acceso', error.message, 'danger');
        }
      });
    }

    // Formulario Registrarse Submit
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-password').value;
        const city = document.getElementById('register-city').value;

        try {
          AuthService.register(username, email, pass, city);
          NotificationSystem.show('¡Cuenta Creada! 🎉', 'Registro exitoso y racha inicializada.', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } catch (error) {
          NotificationSystem.show('Error al Registrar', error.message, 'danger');
        }
      });
    }
  },

  /* ==========================================
     LÓGICA DEL PANEL DE PERFIL DE USUARIO
     ========================================== */
  loadPerfil() {
    console.log('👤 Cargando Vista del Perfil de Usuario...');
    
    const user = AuthService.getCurrentUser();
    const streak = GoalService.getStreak();
    const badges = GoalService.getBadges();
    const summary = TransactionService.getMonthlySummary();

    // 1. Población de Datos
    const avatarLarge = document.getElementById('profile-avatar-large');
    const displayName = document.getElementById('profile-display-name');
    const displayCity = document.getElementById('profile-display-city');
    const displayEmail = document.getElementById('profile-display-email');
    
    if (avatarLarge) {
      avatarLarge.textContent = user.avatar;
      avatarLarge.style.background = `linear-gradient(135deg, ${user.color || 'var(--color-primary)'}, var(--color-accent))`;
    }
    if (displayName) displayName.textContent = user.username;
    if (displayCity) displayCity.textContent = `📍 ${user.city}, Chiapas`;
    if (displayEmail) displayEmail.textContent = user.email;

    // Estadísticas
    const statStreak = document.getElementById('profile-stat-streak');
    const statBadges = document.getElementById('profile-stat-badges');
    const statSavings = document.getElementById('profile-stat-savings');

    if (statStreak) statStreak.textContent = `${streak.count} Días`;
    
    if (statBadges) {
      const unlockedCount = badges.filter(b => b.unlocked).length;
      statBadges.textContent = `${unlockedCount}/${badges.length}`;
    }

    if (statSavings) {
      // Simular ahorro acumulado sumando el balance positivo o meta de ahorro
      const savedAmount = Math.max(0, summary.balance);
      statSavings.textContent = helpers.formatCurrency(savedAmount);
    }

    // Rellenar formulario de edición con valores iniciales
    const editUsername = document.getElementById('edit-username');
    const editCity = document.getElementById('edit-city');
    const editAvatar = document.getElementById('edit-avatar');

    if (editUsername) editUsername.value = user.username;
    if (editCity) editCity.value = user.city;
    if (editAvatar) editAvatar.value = user.avatar;

    // Formulario de Edición Submit
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedUser = AuthService.updateProfile({
          username: editUsername.value,
          city: editCity.value,
          avatar: editAvatar.value
        });

        NotificationSystem.show('¡Guardado! 💾', 'Los cambios en tu perfil se actualizaron con éxito.', 'success');
        
        // Actualizar visuales del perfil
        if (displayName) displayName.textContent = updatedUser.username;
        if (displayCity) displayCity.textContent = `📍 ${updatedUser.city}, Chiapas`;
        if (avatarLarge) avatarLarge.textContent = updatedUser.avatar;
      });
    }

    // Botón de Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout-submit');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        AuthService.logout();
        NotificationSystem.show('Sesión Cerrada 🚪', 'Has salido de FinSense con éxito.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      });
    }

    // Alertas de Ajustes
    const alertPozol = document.getElementById('setting-pozol-alert');
    const alertSplit = document.getElementById('setting-split');

    if (alertPozol) {
      alertPozol.addEventListener('change', (e) => {
        const state = e.target.checked ? 'activada' : 'desactivada';
        NotificationSystem.show('Ajustes de Alerta', `Alerta de gastos de Pozol ${state}.`, 'info');
      });
    }

    if (alertSplit) {
      alertSplit.addEventListener('change', (e) => {
        const state = e.target.checked ? 'activado' : 'desactivado';
        NotificationSystem.show('Split Inteligente', `Split automático de cobros ${state}.`, 'info');
      });
    }
  },

  /* ==========================================
     LÓGICA DEL PANEL PRINCIPAL (DASHBOARD)
     ========================================== */
  loadDashboard() {
    console.log('📊 Cargando Vista del Dashboard...');
    
    const user = AuthService.getCurrentUser();
    
    // Cambiar saludo dinámico del usuario
    const dashboardTitle = document.querySelector('.dashboard-header h1');
    if (dashboardTitle) {
      dashboardTitle.textContent = `¡Qué onda, ${user.username}! 👋`;
    }

    const dashboardAvatar = document.querySelector('.dashboard-header .avatar');
    if (dashboardAvatar) {
      dashboardAvatar.textContent = user.avatar;
      dashboardAvatar.style.backgroundColor = user.color || 'var(--color-primary)';
    }

    // SKELETON LOAD SIMULADO PARA LOGRAR SENSACIÓN DE APP NATIVA PREMIUM
    const listEl = document.getElementById('dashboard-transactions-list');
    const chartContainer = document.getElementById('weekly-bar-chart-container');
    const incomeEl = document.getElementById('kpi-ingresos');
    const expenseEl = document.getElementById('kpi-gastos');
    const balanceEl = document.getElementById('kpi-balance');
    const kpiCards = document.querySelectorAll('.kpi-card');

    if (listEl) {
      listEl.innerHTML = `
        <div class="tx-item skeleton" style="height: 58px; margin-bottom: 0.6rem; border: none;"></div>
        <div class="tx-item skeleton" style="height: 58px; margin-bottom: 0.6rem; border: none;"></div>
        <div class="tx-item skeleton" style="height: 58px; margin-bottom: 0.6rem; border: none;"></div>
      `;
    }

    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="skeleton" style="height: 140px; border-radius: var(--radius-md); width: 100%;"></div>
      `;
    }

    kpiCards.forEach(card => card.classList.add('skeleton'));

    setTimeout(() => {
      // Remover skeletons de los KPIs
      kpiCards.forEach(card => card.classList.remove('skeleton'));

      // Obtener datos reales
      const summary = TransactionService.getMonthlySummary();
      const transactions = TransactionService.getTransactions();
      const weeklySpending = TransactionService.getWeeklySpending();
      
      // Actualizar KPIs reales
      if (incomeEl) incomeEl.textContent = helpers.formatCurrency(summary.ingresos);
      if (expenseEl) expenseEl.textContent = helpers.formatCurrency(summary.gastos);
      if (balanceEl) {
        balanceEl.textContent = helpers.formatCurrency(summary.balance);
        balanceEl.style.color = summary.balance < 0 ? 'var(--color-danger)' : 'var(--color-text)';
      }

      const usageTextEl = document.getElementById('budget-usage-text');
      const usageBarEl = document.getElementById('budget-usage-bar');
      if (usageTextEl) usageTextEl.textContent = `${Math.round(summary.percentSpent)}% consumido`;
      if (usageBarEl) {
        usageBarEl.style.setProperty('--target-width', `${summary.percentSpent}%`);
        usageBarEl.style.width = `${summary.percentSpent}%`;
        
        if (summary.percentSpent > 80) {
          usageBarEl.style.background = 'var(--color-danger)';
        } else if (summary.percentSpent > 50) {
          usageBarEl.style.background = 'var(--color-warning)';
        } else {
          usageBarEl.style.background = 'linear-gradient(90deg, var(--color-accent), var(--color-primary-light))';
        }
      }

      // Actualizar Dona SVG
      Charts.updateBalanceDonut(summary.ingresos, summary.gastos);

      // Renderizar el gráfico de barras semanal
      Charts.renderWeeklyBarChart('weekly-bar-chart-container', weeklySpending);

      // Cargar Racha
      const streak = GoalService.getStreak();
      const streakEl = document.getElementById('streak-count-display');
      if (streakEl) {
        streakEl.textContent = `${streak.count} Días`;
      }

      // Cargar y filtrar transacciones
      this.renderTransactionsList(transactions);

      // Vincular listeners de filtros
      const searchInput = document.getElementById('tx-search-input');
      const categorySelect = document.getElementById('tx-filter-category');
      const typeSelect = document.getElementById('tx-filter-type');

      const filterAndRender = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const catVal = categorySelect ? categorySelect.value : 'todos';
        const typeVal = typeSelect ? typeSelect.value : 'todos';

        const allTxs = TransactionService.getTransactions();
        const filtered = allTxs.filter(tx => {
          const matchesQuery = tx.description.toLowerCase().includes(query) || (tx.note && tx.note.toLowerCase().includes(query));
          const matchesCat = catVal === 'todos' || tx.category === catVal;
          const matchesType = typeVal === 'todos' || tx.type === typeVal;
          return matchesQuery && matchesCat && matchesType;
        });

        this.renderTransactionsList(filtered);
      };

      if (searchInput) searchInput.addEventListener('input', filterAndRender);
      if (categorySelect) categorySelect.addEventListener('change', filterAndRender);
      if (typeSelect) typeSelect.addEventListener('change', filterAndRender);

      // Cargar Benchmark Local Widget
      const benchmarkContainer = document.getElementById('benchmark-local-widget');
      if (benchmarkContainer) {
        const cityComparison = BenchmarkService.getComparison();
        const score = BenchmarkService.getGeneralBenchmarkScore();
        
        const scoreEl = document.getElementById('benchmark-score-display');
        if (scoreEl) scoreEl.textContent = `${score}/100`;

        benchmarkContainer.innerHTML = cityComparison.map(c => {
          const percent = Math.min(100, Math.max(10, Math.round((c.userValue / c.cityValue) * 100)));
          const isExceeded = c.status === 'alerta';
          
          let statusBadge = isExceeded ? `<span class="badge badge-danger">Excedido</span>` : 
                             c.status === 'medio' ? `<span class="badge badge-warning">En el promedio</span>` : 
                             `<span class="badge badge-success">Bajo el promedio</span>`;

          const categoryIcon = c.category === 'comida' ? '🥤 Pozol/Comida' : 
                               c.category === 'renta' ? '🏠 Renta' : 
                               c.category === 'transporte' ? '🚌 Colectivo' : 
                               c.category === 'diversion' ? '🎉 Diversión' : '💸 Otros';

          return `
            <div style="display: flex; flex-direction: column; gap: 0.4rem; padding: 0.8rem; background: rgba(255,255,255,0.3); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="font-weight: 700; font-family: var(--font-title);">${categoryIcon}</span>
                ${statusBadge}
              </div>
              
              <div style="position: relative; height: 8px; background: rgba(15,23,42,0.06); border-radius: var(--radius-full); margin: 0.2rem 0;">
                <div style="position: absolute; left: 60%; top: -4px; width: 3px; height: 16px; background: var(--color-primary); z-index: 5; border-radius: 2px;" title="Promedio de Tuxtla"></div>
                <div style="height: 100%; border-radius: var(--radius-full); width: ${percent}%; background: ${isExceeded ? 'var(--color-danger)' : 'var(--color-success)'}; transition: width 0.8s ease;"></div>
              </div>
              
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
                <span>Tú: <strong>${helpers.formatCurrency(c.userValue)}</strong></span>
                <span>Promedio Tuxtla: <strong>${helpers.formatCurrency(c.cityValue)}</strong></span>
              </div>
            </div>
          `;
        }).join('');
      }
    }, 600);
  },

  renderTransactionsList(transactions) {
    const listEl = document.getElementById('dashboard-transactions-list');
    if (!listEl) return;

    if (transactions.length === 0) {
      listEl.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 1.5rem;">No se encontraron transacciones con los filtros activos.</p>';
      return;
    }

    listEl.innerHTML = transactions.map(tx => {
      const isExpense = tx.type === 'gasto';
      const icon = tx.category === 'comida' ? '🥤' : 
                   tx.category === 'renta' ? '🏠' : 
                   tx.category === 'transporte' ? '🚌' : 
                   tx.category === 'diversion' ? '🎉' : 
                   tx.category === 'servicios' ? '💡' : '💸';
      const categoryColor = isExpense ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
      
      return `
        <div class="tx-item animate-fade-up" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
            <div class="tx-icon-wrapper" style="background: ${categoryColor}">
              ${icon}
            </div>
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700;">${tx.description}</h4>
              <p style="font-size: 0.8rem; color: var(--color-text-muted);">${helpers.getRelativeDate(tx.date)}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span class="text-numeric" style="font-weight: 700; color: ${isExpense ? 'var(--color-danger)' : 'var(--color-success)'}; font-size: 0.95rem;">
              ${isExpense ? '-' : '+'}${helpers.formatCurrency(tx.amount)}
            </span>
            <div style="display: flex; gap: 0.25rem;">
              <button class="btn-edit-tx" data-id="${tx.id}" style="background: rgba(26, 86, 219, 0.08); border: none; padding: 0.35rem 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: background 0.2s;" onmouseenter="this.style.background='rgba(26,86,219,0.15)'" onmouseleave="this.style.background='rgba(26,86,219,0.08)'">✏️</button>
              <button class="btn-delete-tx" data-id="${tx.id}" style="background: rgba(239, 68, 68, 0.08); border: none; padding: 0.35rem 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: background 0.2s;" onmouseenter="this.style.background='rgba(239, 68, 68, 0.15)'" onmouseleave="this.style.background='rgba(239, 68, 68, 0.08)'">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.bindTransactionActions();
  },

  bindTransactionActions() {
    // Delete action
    const deleteButtons = document.querySelectorAll('.btn-delete-tx');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm('¿De verdad quieres eliminar esta transacción? 🗑️')) {
          TransactionService.deleteTransaction(id);
          NotificationSystem.show('Eliminado', 'Transacción borrada exitosamente.', 'success');
        }
      });
    });

    // Edit action
    const editButtons = document.querySelectorAll('.btn-edit-tx');
    const modal = document.getElementById('edit-transaction-modal');
    const editForm = document.getElementById('edit-transaction-form');

    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const txs = TransactionService.getTransactions();
        const tx = txs.find(t => t.id === id);
        
        if (tx) {
          document.getElementById('edit-tx-id').value = tx.id;
          document.getElementById('edit-tx-description').value = tx.description;
          document.getElementById('edit-tx-amount').value = tx.amount;
          document.getElementById('edit-tx-type').value = tx.type;
          document.getElementById('edit-tx-category').value = tx.category;
          document.getElementById('edit-tx-note').value = tx.note || '';

          if (modal) {
            modal.style.display = 'flex';
          }
        }
      });
    });

    // Close Modal Button
    const closeBtn = document.getElementById('btn-close-edit-modal');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }

    // Submit Edit Form
    if (editForm && !editForm.dataset.bound) {
      editForm.dataset.bound = 'true';
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-tx-id').value;
        const updated = {
          description: document.getElementById('edit-tx-description').value,
          amount: parseFloat(document.getElementById('edit-tx-amount').value) || 0,
          type: document.getElementById('edit-tx-type').value,
          category: document.getElementById('edit-tx-category').value,
          note: document.getElementById('edit-tx-note').value
        };

        TransactionService.updateTransaction(id, updated);
        if (modal) modal.style.display = 'none';
        NotificationSystem.show('Actualizado', 'Transacción guardada con éxito.', 'success');
      });
    }
  },

  /* ==========================================
     LÓGICA DE REGISTRO DE TRANSACCIÓN
     ========================================== */
  loadRegistro() {
    console.log('📝 Cargando Vista de Registro...');
    
    // Toggle Pill animado de tipo (Gasto / Ingreso)
    const toggleButtons = document.querySelectorAll('.toggle-pill-btn');
    const slider = document.querySelector('.toggle-pill-slider');
    const selectedTypeInput = document.getElementById('transaction-type');

    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.getAttribute('data-type');
        
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTypeInput.value = type;

        if (type === 'ingreso') {
          slider.style.transform = 'translateX(100%)';
          slider.style.background = 'var(--color-success)';
        } else {
          slider.style.transform = 'translateX(0)';
          slider.style.background = 'var(--color-primary)';
        }
      });
    });

    // Selector de categoría por tap
    const categoryItems = document.querySelectorAll('.category-grid-item');
    const selectedCategoryInput = document.getElementById('transaction-category');

    categoryItems.forEach(item => {
      item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedCategoryInput.value = item.getAttribute('data-category');
        
        // Micro-animación al tap
        item.style.transform = 'scale(0.95)';
        setTimeout(() => item.style.transform = 'scale(1)', 100);
      });
    });

    // Manejar submit del formulario de registro
    const form = document.getElementById('transaction-register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = document.getElementById('amount-input').value;
        const description = document.getElementById('description-input').value;
        const type = selectedTypeInput.value;
        const category = selectedCategoryInput.value;
        const note = document.getElementById('note-input').value;

        if (!amount || parseFloat(amount) <= 0) {
          NotificationSystem.show('Monto Inválido', 'Por favor ingresa una cifra mayor a $0.', 'danger');
          return;
        }

        if (!description) {
          NotificationSystem.show('Faltan Datos', 'Por favor ingresa una descripción para tu registro.', 'warning');
          return;
        }

        // Agregar vía el Service-Oriented Layer
        TransactionService.addTransaction({
          amount: parseFloat(amount),
          description,
          type,
          category,
          note
        });

        // Incrementar racha de registro
        GoalService.incrementStreak();

        // Disparar toast de éxito
        NotificationSystem.show(
          '¡Registro Exitoso! 💸',
          `Se guardó "${description}" por ${helpers.formatCurrency(amount)}.`,
          'success'
        );

        // Limpiar formulario y redireccionar o resetear
        form.reset();
        
        // Reset category active items
        categoryItems.forEach(i => i.classList.remove('active'));
        categoryItems[0].classList.add('active');
        selectedCategoryInput.value = categoryItems[0].getAttribute('data-category');

        // Mostrar confeti o redireccionar al Dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
      });
    }
  },

  /* ==========================================
     LÓGICA DE METAS Y GAMIFICACIÓN
     ========================================== */
  loadMetas() {
    console.log('🎯 Cargando Vista de Metas y Logros...');
    
    const goals = GoalService.getGoals();
    const challenges = GoalService.getChallenges();
    const badges = GoalService.getBadges();
    const streak = GoalService.getStreak();

    // Check for goal completion celebration
    const completedGoals = goals.filter(g => (g.current / g.target) >= 1.0);
    if (completedGoals.length > 0) {
      const triggeredStr = localStorage.getItem('finsense_confetti_triggered') || '[]';
      const triggeredIds = JSON.parse(triggeredStr);
      let newTrigger = false;

      completedGoals.forEach(g => {
        if (!triggeredIds.includes(g.id)) {
          triggeredIds.push(g.id);
          newTrigger = true;
        }
      });

      if (newTrigger) {
        localStorage.setItem('finsense_confetti_triggered', JSON.stringify(triggeredIds));
        setTimeout(() => {
          this.triggerConfetti();
        }, 600);
      }
    }

    // 1. Mostrar metas con anillos de progreso SVG
    const goalsContainer = document.getElementById('goals-container-list');
    if (goalsContainer) {
      goalsContainer.innerHTML = goals.map(g => {
        const percent = Math.min(100, Math.round((g.current / g.target) * 100));
        
        // Anillo de progreso SVG (r=45, circunf=283)
        const circumference = 283;
        const offset = circumference - (percent / 100 * circumference);

        return `
          <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <span class="badge ${percent === 100 ? 'badge-success' : 'badge-accent'}" style="align-self: flex-start;">
                ${percent === 100 ? '¡Completada!' : 'Activa'}
              </span>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 0.3rem;">${g.title}</h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted);">Fecha límite: ${helpers.formatDate(g.deadline)}</p>
              
              <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                <span class="text-numeric" style="font-weight: 700; color: var(--color-primary);">${helpers.formatCurrency(g.current)}</span>
                <span style="color: var(--color-text-muted);"> de ${helpers.formatCurrency(g.target)}</span>
              </div>
            </div>
            
            <!-- Progreso Circular SVG -->
            <div style="position: relative; width: 85px; height: 85px;">
              <svg width="85" height="85" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(15, 23, 42, 0.05)" stroke-width="8" fill="transparent"></circle>
                <circle class="circle-progress-bar" cx="50" cy="50" r="45" stroke="var(--color-accent)" stroke-width="8" fill="transparent" 
                        stroke-dasharray="283" stroke-dashoffset="${offset}" style="--target-offset: ${offset}"></circle>
              </svg>
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-numeric); font-size: 0.85rem; font-weight: 700;">
                ${percent}%
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Renderizar desafíos semanales
    const challengesContainer = document.getElementById('weekly-challenges-list');
    if (challengesContainer) {
      challengesContainer.innerHTML = challenges.map(c => {
        const percent = Math.min(100, Math.round((c.progress / c.target) * 100));
        
        return `
          <div style="padding: 1rem; background: rgba(255,255,255,0.4); border-radius: var(--radius-md); border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700;">${c.title}</h4>
                <p style="font-size: 0.75rem; color: var(--color-text-muted);">${c.description}</p>
              </div>
              <span class="badge badge-warning" style="font-size: 0.65rem;">+${c.points} XP</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.2rem;">
              <!-- Barra de progreso lineal -->
              <div style="flex: 1; height: 6px; background: rgba(15,23,42,0.06); border-radius: var(--radius-full); overflow: hidden;">
                <div style="height: 100%; background: var(--color-primary); width: ${percent}%; transition: width 1s ease;"></div>
              </div>
              <span class="text-numeric" style="font-size: 0.75rem; font-weight: 700;">
                ${c.progress}/${c.target}
              </span>
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); text-align: right;">
              Tiempo restante: <strong>${c.timeLeft}</strong>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Renderizar insignias
    const badgesContainer = document.getElementById('badges-grid-list');
    if (badgesContainer) {
      badgesContainer.innerHTML = badges.map(b => {
        return `
          <div class="glass-card ${b.unlocked ? 'badge-unlocked' : 'badge-locked'}" style="text-align: center; padding: 1.25rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <div style="font-size: 2.2rem; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); border-radius: 50%; box-shadow: var(--shadow-sm);">
              ${b.icon}
            </div>
            <h4 style="font-size: 0.85rem; font-weight: 700; margin-top: 0.2rem;">${b.title}</h4>
            <p style="font-size: 0.7rem; color: var(--color-text-muted); line-height: 1.2;">${b.description}</p>
            ${b.unlocked ? 
              `<span class="badge badge-success" style="font-size: 0.6rem; padding: 0.1rem 0.4rem; margin-top: 0.3rem;">Desbloqueada</span>` : 
              `<span class="badge" style="background: rgba(0,0,0,0.05); color: var(--color-text-muted); font-size: 0.6rem; padding: 0.1rem 0.4rem; margin-top: 0.3rem;">Bloqueada</span>`
            }
          </div>
        `;
      }).join('');
    }

    // 4. Mostrar racha y panel tipo GitHub contributions
    const streakDisplayEl = document.getElementById('metas-streak-display');
    if (streakDisplayEl) {
      streakDisplayEl.textContent = `${streak.count} días seguidos`;
    }
  },

  /* ==========================================
     LÓGICA DEL MODO COLABORATIVO (GRUPOS)
     ========================================== */
  loadGrupos() {
    console.log('👥 Cargando Vista del Modo Colaborativo...');
    
    const balances = GroupService.getBalancesForUser();
    const groupExpenses = GroupService.getGroupExpenses();
    const members = GroupService.getMembers();

    // 1. Cargar avatares apilados
    const avatarStackEl = document.getElementById('group-avatar-stack');
    if (avatarStackEl) {
      avatarStackEl.innerHTML = members.map(m => `
        <div class="avatar" style="background-color: ${m.color}" title="${m.name}">
          ${m.avatar}
        </div>
      `).join('');
    }

    // 2. Renderizar tarjetas flip 3D de balance
    const balancesContainer = document.getElementById('group-balances-cards');
    if (balancesContainer) {
      balancesContainer.innerHTML = balances.map(b => {
        const isCreditor = b.relationType === 'te_debe';
        const isSaldado = b.relationType === 'neutral';
        
        let colorClass = 'var(--color-text-muted)';
        let symbol = '';
        if (isCreditor) {
          colorClass = 'var(--color-success)';
          symbol = '+';
        } else if (b.relationType === 'debes') {
          colorClass = 'var(--color-danger)';
          symbol = '-';
        }

        // Construir detalles en el reverso
        const detailList = b.details.length > 0 ? 
          b.details.map(d => `
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0.3rem 0;">
              <span style="max-width: 140px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.desc}</span>
              <span class="text-numeric" style="font-weight: 700; color: ${d.type === 'cobro' ? 'var(--color-success)' : 'var(--color-danger)'}">${helpers.formatCurrency(d.amount)}</span>
            </div>
          `).join('') :
          `<p style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 1rem;">Sin gastos pendientes directos.</p>`;

        return `
          <div class="flip-card" onclick="this.classList.toggle('flipped')">
            <div class="flip-card-inner">
              
              <!-- Frente de la Tarjeta -->
              <div class="flip-card-front">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="avatar" style="background-color: ${b.member.color}; width: 44px; height: 44px; font-size: 1.3rem;">
                    ${b.member.avatar}
                  </div>
                  <div style="text-align: left;">
                    <h3 style="font-size: 1rem; font-weight: 700;">${b.member.name}</h3>
                    <p style="font-size: 0.75rem; color: var(--color-text-muted);">${b.text}</p>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1rem;">
                  <span class="text-numeric" style="font-size: 1.45rem; font-weight: 800; color: ${colorClass}">
                    ${isSaldado ? '' : symbol}${helpers.formatCurrency(b.value)}
                  </span>
                  <span style="font-size: 0.65rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 0.2rem;">
                    Tap para ver detalle 🔄
                  </span>
                </div>
              </div>
              
              <!-- Reverso de la Tarjeta (3D Flip back) -->
              <div class="flip-card-back">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Desglose de Deudas</h4>
                  <span style="font-size: 0.65rem; color: rgba(255,255,255,0.5);">Cerrar 🔄</span>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.2rem; overflow-y: auto;">
                  ${detailList}
                </div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.4); text-align: left; margin-top: 0.4rem;">
                  Neto a saldar: <strong style="color: var(--color-success)">${helpers.formatCurrency(b.value)}</strong>
                </div>
              </div>
              
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Renderizar transacciones grupales recientes
    const groupTxContainer = document.getElementById('group-shared-expenses-list');
    if (groupTxContainer) {
      groupTxContainer.innerHTML = groupExpenses.map(ge => {
        const payer = members.find(m => m.id === ge.paidBy);
        return `
          <div class="tx-item" style="padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="avatar" style="background-color: ${payer.color}; width: 38px; height: 38px; font-size: 1.1rem; border: none;">
                ${payer.avatar}
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700;">${ge.description}</h4>
                <p style="font-size: 0.75rem; color: var(--color-text-muted);">
                  Pagado por <strong>${payer.name}</strong> • ${ge.breakdown}
                </p>
              </div>
            </div>
            <div style="text-align: right;">
              <span class="text-numeric" style="font-weight: 700; color: var(--color-text); font-size: 1rem;">
                ${helpers.formatCurrency(ge.totalAmount)}
              </span>
              <p style="font-size: 0.7rem; color: var(--color-text-muted);">${helpers.getRelativeDate(ge.date)}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Vincular Modal de Registro Grupal
    const groupModal = document.getElementById('group-expense-modal');
    const triggerBtn = document.getElementById('btn-trigger-group-modal');
    const fabBtn = document.getElementById('fab-add-group-expense');
    const closeBtn = document.getElementById('btn-close-group-modal');
    const groupForm = document.getElementById('group-expense-form');

    const openModal = () => {
      if (groupModal) groupModal.style.display = 'flex';
    };

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (fabBtn) fabBtn.addEventListener('click', openModal);
    if (closeBtn && groupModal) {
      closeBtn.addEventListener('click', () => {
        groupModal.style.display = 'none';
      });
    }

    if (groupModal) {
      groupModal.addEventListener('click', (e) => {
        if (e.target === groupModal) {
          groupModal.style.display = 'none';
        }
      });
    }

    if (groupForm && !groupForm.dataset.bound) {
      groupForm.dataset.bound = 'true';
      groupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('group-tx-description').value;
        const totalAmount = parseFloat(document.getElementById('group-tx-amount').value) || 0;
        const payerKey = document.getElementById('group-tx-payer').value;
        const splitType = document.getElementById('group-tx-split').value;

        let paidBy = 'm_kaled';
        if (payerKey === 'friend_1') paidBy = 'm_sofia';
        else if (payerKey === 'friend_2') paidBy = 'm_marco';
        else if (payerKey === 'friend_3') paidBy = 'm_valeria';

        let splitWith = ['m_kaled', 'm_marco', 'm_sofia', 'm_valeria'];
        if (splitType === 'mitad') {
          splitWith = paidBy === 'm_kaled' ? ['m_kaled', 'm_sofia'] : ['m_kaled', paidBy];
        }

        GroupService.addGroupExpense({
          description,
          totalAmount,
          paidBy,
          splitWith
        });

        if (groupModal) groupModal.style.display = 'none';
        groupForm.reset();
        NotificationSystem.show('¡Gasto Registrado! 👥', 'El saldo grupal se recalculó.', 'success');
        this.loadGrupos();
      });
    }
  }
};

// Autoejecución al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
