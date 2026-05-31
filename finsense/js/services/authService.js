/**
 * AuthService (Capa de Servicio - Autenticación y Sesión)
 * Controla el Registro, Login, Logout y lectura de datos del perfil del usuario.
 */

const USERS_KEY = 'finsense_users';
const SESSION_KEY = 'finsense_session';

const SEED_USERS = [
  {
    id: 'u_kaled',
    username: 'Kaled',
    email: 'kaled@finsense.mx',
    password: '123', // Encriptado en producción, texto plano para maqueta
    city: 'Tuxtla Gutiérrez',
    avatar: '🦖',
    color: '#1A56DB',
    xp: 125, // Inicia en Nivel 2
    createdAt: new Date().toISOString()
  }
];

export const AuthService = {
  /**
   * Obtiene todos los usuarios registrados
   */
  getUsers() {
    let users = localStorage.getItem(USERS_KEY);
    if (!users) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(users);
  },

  /**
   * Registra un nuevo usuario en la PWA
   * @param {string} username - Nombre de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Clave de acceso
   * @param {string} city - Ciudad de residencia
   */
  register(username, email, password, city = 'Tuxtla Gutiérrez') {
    const users = this.getUsers();
    
    // Verificar si el correo ya está registrado
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('El correo electrónico ya se encuentra registrado.');
    }

    const avatars = ['🦖', '🦁', '🦊', '🐼', '🐨', '🐸', '🦉', '🐝'];
    const colors = ['#1A56DB', '#10B981', '#EC4899', '#F59E0B', '#6366F1', '#8B5CF6', '#EF4444', '#06B6D4'];
    const randomIdx = Math.floor(Math.random() * avatars.length);

    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      username,
      email,
      password,
      city,
      avatar: avatars[randomIdx],
      color: colors[randomIdx],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Iniciar sesión automáticamente
    this.createSession(newUser);
    return newUser;
  },

  /**
   * Inicia sesión validando credenciales
   * @param {string} email - Correo
   * @param {string} password - Clave
   */
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    this.createSession(user);
    return user;
  },

  /**
   * Cierra la sesión activa
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('finsense_auth_changed'));
  },

  /**
   * Crea una sesión activa persistente
   */
  createSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('finsense_auth_changed'));
  },

  /**
   * Obtiene el usuario autenticado actualmente
   */
  getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      // Para mantener compatibilidad con las transacciones por defecto,
      // si no hay sesión, auto-iniciamos sesión con el usuario semilla
      const seed = this.getUsers()[0];
      this.createSession(seed);
      return seed;
    }
    return JSON.parse(session);
  },

  /**
   * Verifica si hay una sesión activa real
   */
  isAuthenticated() {
    return localStorage.getItem(SESSION_KEY) !== null;
  },

  /**
   * Actualiza los datos del perfil del usuario
   */
  updateProfile(data) {
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);

    if (idx !== -1) {
      users[idx].username = data.username || users[idx].username;
      users[idx].city = data.city || users[idx].city;
      users[idx].avatar = data.avatar || users[idx].avatar;
      
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      this.createSession(users[idx]); // Actualizar sesión activa
      
      window.dispatchEvent(new CustomEvent('finsense_data_changed'));
      return users[idx];
    }
    return currentUser;
  },

  /**
   * Obtiene la información del XP y nivel del usuario actual
   */
  getXPInfo() {
    const user = this.getCurrentUser();
    const xp = user.xp || 0;
    
    let level = 1;
    let xpNeededForNext = 100;
    let xpInCurrentLevel = xp;
    let tempXp = xp;

    while (tempXp >= xpNeededForNext) {
      tempXp -= xpNeededForNext;
      level++;
      xpNeededForNext = level * 100;
    }
    xpInCurrentLevel = tempXp;

    const percent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

    let title = 'Novato Ahorrador 🐰';
    if (level >= 5) title = 'Maestro Chiapaneco 🌶️';
    else if (level >= 4) title = 'Ahorrador de Colectivos 🚌';
    else if (level >= 3) title = 'Comprador de Pozol Fiel 🥤';
    else if (level >= 2) title = 'Cazador de Ofertas Tuxtleco 🛒';

    return {
      xp,
      level,
      xpInCurrentLevel,
      xpNeededForNext,
      percent,
      title
    };
  },

  /**
   * Incrementa el XP del usuario
   * @param {number} amount - Puntos a sumar
   */
  addXP(amount) {
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);

    if (idx !== -1) {
      const currentXP = users[idx].xp || 0;
      const oldInfo = this.getXPInfo();
      
      users[idx].xp = currentXP + amount;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      this.createSession(users[idx]); // Actualizar sesión activa
      
      const newInfo = this.getXPInfo();
      if (newInfo.level > oldInfo.level) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('finsense_level_up', { 
            detail: { level: newInfo.level, title: newInfo.title } 
          }));
        }, 300);
      }

      window.dispatchEvent(new CustomEvent('finsense_xp_changed'));
      window.dispatchEvent(new CustomEvent('finsense_data_changed'));
    }
  }
};
