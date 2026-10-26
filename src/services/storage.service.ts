/**
 * Shared storage keys for registration and registrar enlistment states.
 */
export const STORAGE_KEYS = {
  REGISTRATION: "omr-merged-reg-v3",
  ENLISTMENT: "omr-merged-enl-v3",
} as const;

/**
 * Storage service for managing demo state persistence and resets.
 */
export const storageService = {
  resetDemoData(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION);
    localStorage.removeItem(STORAGE_KEYS.ENLISTMENT);
  },

  getRaw(key: string): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  },

  setRaw(key: string, value: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  },
};
