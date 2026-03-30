// ========================================================
// SOS Hub Canada - Service de notifications et audit
// ========================================================

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'alerte' | 'document' | 'dossier' | 'systeme' | 'rdv';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

const NOTIFICATIONS_KEY = 'soshub_notifications';
const AUDIT_LOG_KEY = 'soshub_audit_log';

// --- Notifications ---

export function getNotifications(userId?: string): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = raw ? JSON.parse(raw) : [];
    if (userId) return all.filter(n => n.userId === userId);
    return all;
  } catch {
    return [];
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const notif: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  const all = getNotifications();
  all.unshift(notif);
  // Keep max 200 notifications
  const trimmed = all.slice(0, 200);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  }
  return notif;
}

export function markAsRead(notificationId: string): void {
  const all = getNotifications();
  const idx = all.findIndex(n => n.id === notificationId);
  if (idx >= 0) {
    all[idx].read = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    }
  }
}

export function markAllRead(userId: string): void {
  const all = getNotifications();
  for (const n of all) {
    if (n.userId === userId) n.read = true;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  }
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter(n => !n.read).length;
}

export function deleteNotification(notificationId: string): void {
  const all = getNotifications();
  const filtered = all.filter(n => n.id !== notificationId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  }
}

// --- Audit Log ---

export function getAuditLog(limit?: number): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const all: AuditEntry[] = raw ? JSON.parse(raw) : [];
    if (limit) return all.slice(0, limit);
    return all;
  } catch {
    return [];
  }
}

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const audit: AuditEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const all = getAuditLog();
  all.unshift(audit);
  const trimmed = all.slice(0, 500);
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
  }
  return audit;
}

// --- Document Expiry Checks ---

export function checkDocumentExpiry(
  clients: Array<{
    id: string; firstName: string; lastName: string;
    documents: Array<{ name: string; expiryDate?: string; status?: string }>;
  }>,
  userId: string
): Notification[] {
  const alerts: Notification[] = [];
  const now = new Date();
  for (const client of clients) {
    for (const doc of client.documents) {
      if (!doc.expiryDate) continue;
      const expiry = new Date(doc.expiryDate);
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        alerts.push(addNotification({
          type: 'error',
          category: 'document',
          title: 'Document expiré',
          message: `${doc.name} de ${client.firstName} ${client.lastName} est expiré depuis ${Math.abs(daysLeft)} jour(s)`,
          link: '/crm/clients',
          userId,
        }));
      } else if (daysLeft <= 30) {
        alerts.push(addNotification({
          type: 'warning',
          category: 'document',
          title: 'Document bientôt expiré',
          message: `${doc.name} de ${client.firstName} ${client.lastName} expire dans ${daysLeft} jour(s)`,
          link: '/crm/clients',
          userId,
        }));
      }
    }
  }
  return alerts;
}

// --- Deadline Checks ---

export function checkDeadlines(
  cases: Array<{
    id: string; title: string; deadline: string; status: string; clientId: string;
  }>,
  clients: Array<{ id: string; firstName: string; lastName: string }>,
  userId: string
): Notification[] {
  const alerts: Notification[] = [];
  const now = new Date();
  for (const c of cases) {
    if (!c.deadline || ['ferme', 'approuve', 'refuse'].includes(c.status)) continue;
    const deadline = new Date(c.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const client = clients.find(cl => cl.id === c.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : '';
    if (daysLeft < 0) {
      alerts.push(addNotification({
        type: 'error',
        category: 'dossier',
        title: 'Échéance dépassée',
        message: `${c.title} (${clientName}) — échéance dépassée de ${Math.abs(daysLeft)} jour(s)`,
        link: '/crm/dossiers',
        userId,
      }));
    } else if (daysLeft <= 7) {
      alerts.push(addNotification({
        type: 'warning',
        category: 'dossier',
        title: 'Échéance imminente',
        message: `${c.title} (${clientName}) — échéance dans ${daysLeft} jour(s)`,
        link: '/crm/dossiers',
        userId,
      }));
    }
  }
  return alerts;
}

// --- Generate all alerts at once ---

export function generateAlerts(
  clients: Array<{
    id: string; firstName: string; lastName: string;
    documents: Array<{ name: string; expiryDate?: string; status?: string }>;
  }>,
  cases: Array<{
    id: string; title: string; deadline: string; status: string; clientId: string;
  }>,
  userId: string
): Notification[] {
  const docAlerts = checkDocumentExpiry(clients, userId);
  const deadlineAlerts = checkDeadlines(cases, clients, userId);
  return [...docAlerts, ...deadlineAlerts];
}
