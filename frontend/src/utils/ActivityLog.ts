export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status-change'
  | 'permission-change'
  | 'login'
  | 'logout';

export interface ActivityLogEntry {
  id: string; // uuid-like
  userId: number;
  action: ActivityAction;
  timestamp: string; // ISO string
  actor?: string; // who performed the action
  details?: string;
}

const STORAGE_KEY = 'activity_logs';

function readAll(): ActivityLogEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ActivityLogEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function logAction(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { timestamp?: string }) {
  const all = readAll();
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const newEntry: ActivityLogEntry = {
    id,
    timestamp: entry.timestamp || new Date().toISOString(),
    userId: entry.userId,
    action: entry.action,
    actor: entry.actor,
    details: entry.details,
  };
  all.unshift(newEntry);
  writeAll(all);
  return newEntry;
}

export function getLogsForUser(userId: number): ActivityLogEntry[] {
  return readAll().filter(e => e.userId === userId);
}

export function getAllLogs(): ActivityLogEntry[] {
  return readAll();
}

export function clearLogsForUser(userId: number) {
  const rest = readAll().filter(e => e.userId !== userId);
  writeAll(rest);
}

export function clearAllLogs() {
  writeAll([]);
}
