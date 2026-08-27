/**
 * Immutable Security Audit Logger for recording ERP system events,
 * price changes, stock deletions, and order status updates.
 */

export interface AuditLogEntry {
  id: string;
  user_id?: string | null;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: 'product' | 'inventory' | 'order' | 'category' | 'pricing' | 'employee' | 'settings' | string;
  entity_id?: string | null;
  entity_name?: string | null;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogStats {
  total: number;
  today: number;
  priceChanges: number;
  stockChanges: number;
  orderChanges: number;
}

export function getActiveEmployee(): { name: string; role: string; id?: string } {
  if (typeof window === 'undefined') {
    return { name: 'Rəşad Məmmədov', role: 'Super Admin' };
  }
  try {
    const raw = localStorage.getItem('erp_active_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || parsed.username || 'Rəşad Məmmədov',
        role: parsed.role || 'Super Admin',
        id: parsed.id || parsed.userId || undefined,
      };
    }
  } catch (e) {}
  return { name: 'Rəşad Məmmədov', role: 'Super Admin' };
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('technomania_audit_logs');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export async function fetchAuditLogsFromApi(params: {
  search?: string;
  action?: string;
  entity_type?: string;
  user_name?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.action && params.action !== 'all') query.append('action', params.action);
    if (params.entity_type && params.entity_type !== 'all') query.append('entity_type', params.entity_type);
    if (params.user_name && params.user_name !== 'all') query.append('user_name', params.user_name);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));

    const res = await fetch(`/api/catalog/audit-logs?${query.toString()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.logs)) {
        try {
          localStorage.setItem('technomania_audit_logs', JSON.stringify(data.logs.slice(0, 100)));
        } catch (e) {}
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch audit logs from backend, falling back to local storage:', e);
  }

  const localLogs = getAuditLogs();
  return { logs: localLogs, total: localLogs.length };
}

export async function fetchAuditLogStats(): Promise<AuditLogStats> {
  try {
    const res = await fetch('/api/catalog/audit-logs/stats', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch audit log stats:', e);
  }

  const localLogs = getAuditLogs();
  return {
    total: localLogs.length,
    today: localLogs.length,
    priceChanges: localLogs.filter(l => l.action.includes('price') || l.action.includes('pricing')).length,
    stockChanges: localLogs.filter(l => l.action.includes('stock') || l.action.includes('inventory')).length,
    orderChanges: localLogs.filter(l => l.action.includes('order')).length,
  };
}

export function addAuditLog(
  action: string,
  entity: 'product' | 'inventory' | 'order' | 'category' | 'pricing' | 'employee' | 'settings' | string,
  details: string,
  userOrOptions?: string | {
    user?: string;
    userName?: string;
    userRole?: string;
    userId?: string;
    entityId?: string;
    entityName?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  },
  legacyUser?: string
) {
  if (typeof window === 'undefined') return;

  const activeEmp = getActiveEmployee();
  let userName = activeEmp.name;
  let userRole = activeEmp.role;
  let userId = activeEmp.id || null;
  let entityId: string | null = null;
  let entityName: string | null = null;
  let oldValues: Record<string, any> = {};
  let newValues: Record<string, any> = {};

  if (typeof userOrOptions === 'string') {
    userName = userOrOptions;
  } else if (userOrOptions && typeof userOrOptions === 'object') {
    if (userOrOptions.userName || userOrOptions.user) userName = userOrOptions.userName || userOrOptions.user!;
    if (userOrOptions.userRole) userRole = userOrOptions.userRole;
    if (userOrOptions.userId) userId = userOrOptions.userId;
    if (userOrOptions.entityId) entityId = userOrOptions.entityId;
    if (userOrOptions.entityName) entityName = userOrOptions.entityName;
    if (userOrOptions.oldValues) oldValues = userOrOptions.oldValues;
    if (userOrOptions.newValues) newValues = userOrOptions.newValues;
  } else if (legacyUser) {
    userName = legacyUser;
  }

  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const nowIso = new Date().toISOString();

  const newEntry: AuditLogEntry = {
    id: logId,
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    action,
    entity_type: entity,
    entity_id: entityId,
    entity_name: entityName,
    old_values: oldValues,
    new_values: newValues,
    details,
    ip_address: '127.0.0.1',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'TechnoMania-ERP',
    created_at: nowIso,
  };

  // 1. Update local storage immediately for fast UI feedback
  try {
    const current = getAuditLogs();
    const updated = [newEntry, ...current].slice(0, 300);
    localStorage.setItem('technomania_audit_logs', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('techno_audit_log_added', { detail: newEntry }));
  } catch (e) {
    console.error('Failed to save audit log locally:', e);
  }

  // 2. Push to backend PostgreSQL immutable audit_logs table
  fetch('/api/catalog/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEntry),
  }).catch(err => {
    console.warn('Asynchronous audit log DB sync failed:', err);
  });
}
