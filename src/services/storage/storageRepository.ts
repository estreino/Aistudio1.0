import { RoutineEntry, UserPreferences, FoodItem, CURRENT_SCHEMA_VERSION } from '../../types/models';
import { openDatabase, isIndexedDBAvailable } from './indexedDb';

const LOCALSTORAGE_ENTRIES_KEY = 'myroutine_entries_v1';
const LOCALSTORAGE_PREFS_KEY = 'myroutine_prefs_v1';
const LOCALSTORAGE_FOODS_KEY = 'myroutine_foods_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  workHours: { start: '08:00', end: '17:00' },
  targetWaterMl: 2500,
  preferredUnits: {
    weight: 'kg',
    volume: 'ml',
  },
  reminderPreferences: {
    hydration: false,
    meals: false,
    sleep: false,
    workout: false,
  },
  geminiApiKeyConfigured: false,
};

export class StorageRepository {
  private useFallback: boolean = false;

  constructor() {
    this.useFallback = !isIndexedDBAvailable();
  }

  public getStorageType(): 'indexedDB' | 'localStorage' {
    return this.useFallback ? 'localStorage' : 'indexedDB';
  }

  // ==========================================
  // OPERAÇÕES DE REGISTROS (ENTRIES)
  // ==========================================

  public async saveEntry(entry: RoutineEntry): Promise<void> {
    if (!entry.id || !entry.type) {
      throw new Error('Registro inválido: id e type são obrigatórios.');
    }

    if (this.useFallback) {
      const entries = this.getLocalEntries();
      const existingIndex = entries.findIndex((e) => e.id === entry.id);
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      this.setLocalEntries(entries);
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('entries', 'readwrite');
        const store = tx.objectStore('entries');
        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Falha no IndexedDB, acionando fallback LocalStorage:', err);
      this.useFallback = true;
      return this.saveEntry(entry);
    }
  }

  public async getEntryById(id: string): Promise<RoutineEntry | null> {
    if (this.useFallback) {
      const entries = this.getLocalEntries();
      return entries.find((e) => e.id === id) || null;
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('entries', 'readonly');
        const store = tx.objectStore('entries');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      this.useFallback = true;
      return this.getEntryById(id);
    }
  }

  public async getAllEntries(): Promise<RoutineEntry[]> {
    if (this.useFallback) {
      return this.getLocalEntries().sort(this.sortByTimestampDesc);
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('entries', 'readonly');
        const store = tx.objectStore('entries');
        const request = store.getAll();

        request.onsuccess = () => {
          const list = (request.result || []) as RoutineEntry[];
          resolve(list.sort(this.sortByTimestampDesc));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      this.useFallback = true;
      return this.getAllEntries();
    }
  }

  public async getEntriesByDate(dateStr: string): Promise<RoutineEntry[]> {
    const all = await this.getAllEntries();
    return all.filter((entry) => {
      // Determina a data chave do evento
      const timestamp = this.getEntryDateString(entry);
      return timestamp.startsWith(dateStr);
    });
  }

  public async deleteEntry(id: string): Promise<void> {
    if (this.useFallback) {
      const entries = this.getLocalEntries().filter((e) => e.id !== id);
      this.setLocalEntries(entries);
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('entries', 'readwrite');
        const store = tx.objectStore('entries');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      this.useFallback = true;
      return this.deleteEntry(id);
    }
  }

  // ==========================================
  // OPERAÇÕES DE PREFERÊNCIAS (SETTINGS)
  // ==========================================

  public async getPreferences(): Promise<UserPreferences> {
    if (this.useFallback) {
      const raw = localStorage.getItem(LOCALSTORAGE_PREFS_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('preferences', 'readonly');
        const store = tx.objectStore('preferences');
        const request = store.get('user_preferences');

        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve({ ...DEFAULT_PREFERENCES, ...request.result.value });
          } else {
            resolve(DEFAULT_PREFERENCES);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.useFallback = true;
      return this.getPreferences();
    }
  }

  public async savePreferences(prefs: UserPreferences): Promise<void> {
    if (this.useFallback) {
      localStorage.setItem(LOCALSTORAGE_PREFS_KEY, JSON.stringify(prefs));
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('preferences', 'readwrite');
        const store = tx.objectStore('preferences');
        const request = store.put({ key: 'user_preferences', value: prefs });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.useFallback = true;
      return this.savePreferences(prefs);
    }
  }

  // ==========================================
  // ALIMENTOS PERSONALIZADOS (CUSTOM FOODS)
  // ==========================================

  public async getCustomFoods(): Promise<FoodItem[]> {
    if (this.useFallback) {
      const raw = localStorage.getItem(LOCALSTORAGE_FOODS_KEY);
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('custom_foods', 'readonly');
        const store = tx.objectStore('custom_foods');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.useFallback = true;
      return this.getCustomFoods();
    }
  }

  public async saveCustomFood(food: FoodItem): Promise<void> {
    if (this.useFallback) {
      const list = await this.getCustomFoods();
      const idx = list.findIndex((f) => f.id === food.id);
      if (idx >= 0) list[idx] = food;
      else list.push(food);
      localStorage.setItem(LOCALSTORAGE_FOODS_KEY, JSON.stringify(list));
      return;
    }

    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('custom_foods', 'readwrite');
        const store = tx.objectStore('custom_foods');
        const request = store.put(food);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.useFallback = true;
      return this.saveCustomFood(food);
    }
  }

  // ==========================================
  // LIMPEZA TOTAL DE DADOS (ZONA DE EXCLUSÃO)
  // ==========================================

  public async clearAllData(): Promise<void> {
    localStorage.removeItem(LOCALSTORAGE_ENTRIES_KEY);
    localStorage.removeItem(LOCALSTORAGE_PREFS_KEY);
    localStorage.removeItem(LOCALSTORAGE_FOODS_KEY);

    if (isIndexedDBAvailable()) {
      try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(['entries', 'preferences', 'custom_foods'], 'readwrite');
          tx.objectStore('entries').clear();
          tx.objectStore('preferences').clear();
          tx.objectStore('custom_foods').clear();

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (err) {
        console.warn('Erro ao limpar IndexedDB:', err);
      }
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  private getLocalEntries(): RoutineEntry[] {
    const raw = localStorage.getItem(LOCALSTORAGE_ENTRIES_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private setLocalEntries(entries: RoutineEntry[]): void {
    localStorage.setItem(LOCALSTORAGE_ENTRIES_KEY, JSON.stringify(entries));
  }

  private getEntryDateString(entry: RoutineEntry): string {
    if ('timestamp' in entry && typeof entry.timestamp === 'string') {
      return entry.timestamp;
    }
    if ('bedTime' in entry && typeof entry.bedTime === 'string') {
      return entry.bedTime;
    }
    if ('startTime' in entry && typeof entry.startTime === 'string') {
      return entry.startTime;
    }
    return new Date().toISOString();
  }

  private sortByTimestampDesc(a: RoutineEntry, b: RoutineEntry): number {
    const getDate = (item: RoutineEntry): number => {
      if ('timestamp' in item) return new Date(item.timestamp).getTime();
      if ('bedTime' in item) return new Date(item.bedTime).getTime();
      if ('startTime' in item) return new Date(item.startTime).getTime();
      return 0;
    };
    return getDate(b) - getDate(a);
  }
}

export const storageRepository = new StorageRepository();
