// FinSense — Notification Service (SOA)

export interface AppNotification {
  id: string;
  type: 'budget' | 'reminder' | 'system' | 'streak';
  title: string;
  message: string;
  read: boolean;
  date: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'budget',
    title: 'Límite de presupuesto alcanzado',
    message: '¡Cuidado! Tus gastos en "Comida" han alcanzado el 90% de tu límite establecido para este mes.',
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 'notif_2',
    type: 'streak',
    title: '¡Racha en peligro! 🔥',
    message: 'Aún no has registrado transacciones hoy. Registra un gasto o ingreso para no perder tu racha de 5 días.',
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'notif_3',
    type: 'system',
    title: 'Meta al 50% completada 🎯',
    message: '¡Buen ritmo! Tu meta "Laptop de Estudio" ha cruzado la mitad de su importe objetivo.',
    read: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif_4',
    type: 'reminder',
    title: 'Fin de semana cerca 🚌',
    message: 'Recuerda registrar tus gastos de transporte de esta semana para mantener tus estadísticas de Tuxtla al día.',
    read: true,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  }
];

let mockNotifications = [...MOCK_NOTIFICATIONS];

export async function getNotifications(): Promise<AppNotification[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [...mockNotifications];
}

export async function markAsRead(id: string): Promise<AppNotification[]> {
  await new Promise((r) => setTimeout(r, 200));
  mockNotifications = mockNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return [...mockNotifications];
}

export async function markAllAsRead(): Promise<AppNotification[]> {
  await new Promise((r) => setTimeout(r, 300));
  mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
  return [...mockNotifications];
}

export async function deleteNotification(id: string): Promise<AppNotification[]> {
  await new Promise((r) => setTimeout(r, 200));
  mockNotifications = mockNotifications.filter((n) => n.id !== id);
  return [...mockNotifications];
}

export async function createNotification(
  type: AppNotification['type'],
  title: string,
  message: string
): Promise<AppNotification> {
  const newNotif: AppNotification = {
    id: `notif_${Date.now()}`,
    type,
    title,
    message,
    read: false,
    date: new Date().toISOString(),
  };
  mockNotifications = [newNotif, ...mockNotifications];
  return newNotif;
}
