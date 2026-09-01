export const STORAGE_NAMESPACE = "shiny-stone-sales-os";
export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  version: `${STORAGE_NAMESPACE}-version`,
  customers: `${STORAGE_NAMESPACE}-customers`,
  contacts: `${STORAGE_NAMESPACE}-contacts`,
  deals: `${STORAGE_NAMESPACE}-deals`,
  emails: `${STORAGE_NAMESPACE}-emails`,
  purchaseOrders: `${STORAGE_NAMESPACE}-purchase-orders`,
  followUps: `${STORAGE_NAMESPACE}-follow-ups`,
  workflows: `${STORAGE_NAMESPACE}-workflows`,
  users: `${STORAGE_NAMESPACE}-users`,
  notifications: `${STORAGE_NAMESPACE}-notifications`,
  activities: `${STORAGE_NAMESPACE}-activities`,
  salesTargets: `${STORAGE_NAMESPACE}-sales-targets`,
  settings: `${STORAGE_NAMESPACE}-settings`,
  currentUserId: `${STORAGE_NAMESPACE}-current-user-id`,
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

export function isBrowser() {
  return typeof window !== "undefined";
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function removeFromStorage(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

export function clearAllStorage(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function exportAllStorage(): Record<string, unknown> {
  if (!isBrowser()) return {};
  const result: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        result[name] = JSON.parse(raw);
      } catch {
        result[name] = raw;
      }
    }
  });
  return result;
}

export function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
