/**
 * Missing Millions — localStorage wrapper
 *
 * Persistent client-side storage for property records,
 * import history, and user preferences.
 */

import { PropertyRecord, ImportRecord } from "./types";

const KEYS = {
  DATABASE: "mm_database",
  IMPORT_HISTORY: "mm_import_history",
  USER_PREFS: "mm_user_prefs",
} as const;

interface UserPrefs {
  matchingThreshold: number;
  defaultPostcodeFilter: string;
}

const DEFAULT_PREFS: UserPrefs = {
  matchingThreshold: 0.7,
  defaultPostcodeFilter: "",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

// --- Master Property Database ---

export function getDatabase(): PropertyRecord[] {
  return safeGet<PropertyRecord[]>(KEYS.DATABASE, []);
}

export function saveDatabase(records: PropertyRecord[]): void {
  safeSet(KEYS.DATABASE, records);
}

export function updateDatabaseRecord(
  id: string,
  updates: Partial<PropertyRecord>,
): void {
  const records = getDatabase();
  const updated = records.map((r) =>
    r.id === id ? { ...r, ...updates } : r,
  );
  saveDatabase(updated);
}

export function addToDatabase(records: PropertyRecord[]): PropertyRecord[] {
  const existing = getDatabase();
  const merged = [...existing, ...records];
  saveDatabase(merged);
  return merged;
}

export function clearDatabase(): void {
  safeSet(KEYS.DATABASE, []);
}

// --- Import History ---

export function getImportHistory(): ImportRecord[] {
  return safeGet<ImportRecord[]>(KEYS.IMPORT_HISTORY, []);
}

export function addImportRecord(record: ImportRecord): void {
  const history = getImportHistory();
  safeSet(KEYS.IMPORT_HISTORY, [record, ...history]);
}

export function clearImportHistory(): void {
  safeSet(KEYS.IMPORT_HISTORY, []);
}

// --- User Preferences ---

export function getUserPrefs(): UserPrefs {
  return safeGet<UserPrefs>(KEYS.USER_PREFS, DEFAULT_PREFS);
}

export function saveUserPrefs(prefs: Partial<UserPrefs>): void {
  const current = getUserPrefs();
  safeSet(KEYS.USER_PREFS, { ...current, ...prefs });
}

// --- Clear All ---

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
