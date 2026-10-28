/**
 * Motor central de banco de dados local IndexedDB para o MyRoutine AI.
 * Opera 100% no navegador sem dependências remotas.
 */

const DB_NAME = 'myroutine_db';
const DB_VERSION = 1;

export interface DBStores {
  entries: 'id';
  preferences: 'key';
  custom_foods: 'id';
}

let dbInstance: IDBDatabase | null = null;

export const isIndexedDBAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
};

export const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB não está disponível neste navegador.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para registros da rotina (refeição, sono, cafeína, água, treino, energia)
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        entryStore.createIndex('by_type', 'type', { unique: false });
      }

      // Store para preferências do usuário
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }

      // Store para alimentos cadastrados pelo usuário
      if (!db.objectStoreNames.contains('custom_foods')) {
        const foodStore = db.createObjectStore('custom_foods', { keyPath: 'id' });
        foodStore.createIndex('by_name', 'name', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      // Fechar instância se a versão mudar em outra aba
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      reject(new Error(`Erro ao abrir o IndexedDB: ${error?.message || 'desconhecido'}`));
    };
  });
};
