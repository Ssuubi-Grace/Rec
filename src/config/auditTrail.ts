export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'User' | 'Role' | 'Permission' | 'System';
  entityId: string;
  detail: string;
}

const STORAGE_KEY = 'promise_audit_trail_v1';
const MAX_ENTRIES = 200;

function read(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEntries();
    const parsed = JSON.parse(raw) as AuditEntry[];
    return parsed.length ? parsed : seedEntries();
  } catch {
    return seedEntries();
  }
}

function seedEntries(): AuditEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'audit-seed-1',
      timestamp: now,
      actor: 'System',
      action: 'INIT',
      entityType: 'System',
      entityId: 'audit',
      detail: 'ProMISe recruitment audit trail initialized.',
    },
  ];
}

export function getAuditTrail(limit = 50): AuditEntry[] {
  return read().slice(0, limit);
}

export function appendAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp?: string }) {
  const list = read();
  const row: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    detail: entry.detail,
  };
  list.unshift(row);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent('promise-audit-updated'));
  return row;
}
