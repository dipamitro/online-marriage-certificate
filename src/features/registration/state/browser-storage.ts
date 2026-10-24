/** Preserve the existing key-storage adapter independently of registration records. */
export const browserStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore storage write errors for key cache */
    }
  },
  del(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore storage removal errors */
    }
  },
};
