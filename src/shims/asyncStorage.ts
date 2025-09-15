const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (!storage) return null;
      return storage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!storage) return;
      storage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (!storage) return;
      storage.removeItem(key);
    } catch {
      // ignore
    }
  },
  async multiRemove(keys: string[]): Promise<void> {
    try {
      if (!storage) return;
      keys.forEach((k) => storage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

export default AsyncStorage;


