import { useState, useEffect, useCallback } from 'react';
import { RoutineEntry, UserPreferences, FoodItem } from '../types/models';
import { storageRepository, DEFAULT_PREFERENCES } from '../services/storage/storageRepository';
import { backupService, ImportResult } from '../services/backup/backupService';

export function useRoutineStorage() {
  const [entries, setEntries] = useState<RoutineEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [storageType, setStorageType] = useState<'indexedDB' | 'localStorage'>('indexedDB');

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setStorageType(storageRepository.getStorageType());
      const [allEntries, userPrefs, foods] = await Promise.all([
        storageRepository.getAllEntries(),
        storageRepository.getPreferences(),
        storageRepository.getCustomFoods(),
      ]);
      setEntries(allEntries);
      setPreferences(userPrefs);
      setCustomFoods(foods);
    } catch (err) {
      console.error('Erro ao carregar dados locais:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const addEntry = async (entry: RoutineEntry) => {
    await storageRepository.saveEntry(entry);
    await reloadData();
  };

  const updateEntry = async (entry: RoutineEntry) => {
    await storageRepository.saveEntry(entry);
    await reloadData();
  };

  const removeEntry = async (id: string) => {
    await storageRepository.deleteEntry(id);
    await reloadData();
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    await storageRepository.savePreferences(updated);
    setPreferences(updated);
  };

  const saveCustomFood = async (food: FoodItem) => {
    await storageRepository.saveCustomFood(food);
    await reloadData();
  };

  const exportBackupFile = async () => {
    await backupService.downloadBackupFile();
  };

  const importBackupFile = async (jsonString: string): Promise<ImportResult> => {
    const result = await backupService.importBackup(jsonString);
    if (result.success) {
      await reloadData();
    }
    return result;
  };

  const clearAllLocalData = async () => {
    await storageRepository.clearAllData();
    await reloadData();
  };

  return {
    entries,
    preferences,
    customFoods,
    isLoading,
    storageType,
    reloadData,
    addEntry,
    updateEntry,
    removeEntry,
    updatePreferences,
    saveCustomFood,
    exportBackupFile,
    importBackupFile,
    clearAllLocalData,
  };
}
