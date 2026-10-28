import { DatabaseBackup, CURRENT_SCHEMA_VERSION, RoutineEntry, FoodItem } from '../../types/models';
import { storageRepository } from '../storage/storageRepository';

export interface ImportResult {
  success: boolean;
  entriesImported: number;
  customFoodsImported: number;
  skippedDuplicates: number;
  message: string;
}

export class BackupService {
  /**
   * Exporta todos os registros locais em uma string JSON validada e versionada.
   * Não inclui senhas, chaves de API ou dados de rastreamento.
   */
  public async exportBackup(): Promise<string> {
    const entries = await storageRepository.getAllEntries();
    const customFoods = await storageRepository.getCustomFoods();
    const preferences = await storageRepository.getPreferences();

    // Sanitização de segurança: removemos explicitamente qualquer indício de segredos
    const sanitizedPrefs = { ...preferences };
    delete (sanitizedPrefs as Record<string, unknown>).geminiApiKey;

    const backupData: DatabaseBackup = {
      appVersion: '1.0.0',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
      customFoods,
      preferences: sanitizedPrefs,
    };

    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Dispara o download automático do arquivo de backup no navegador/Safari.
   */
  public async downloadBackupFile(filename?: string): Promise<void> {
    const jsonContent = await this.exportBackup();
    const now = new Date();
    const dateStamp = now.toISOString().split('T')[0];
    const finalName = filename || `MyRoutine_Backup_${dateStamp}.json`;

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', finalName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Valida e importa um arquivo de backup JSON.
   * Detecta duplicatas de ID para não sobregravar indevidamente sem permissão.
   */
  public async importBackup(jsonString: string): Promise<ImportResult> {
    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return {
        success: false,
        entriesImported: 0,
        customFoodsImported: 0,
        skippedDuplicates: 0,
        message: 'Arquivo inválido: o conteúdo selecionado não é um JSON válido.',
      };
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        entriesImported: 0,
        customFoodsImported: 0,
        skippedDuplicates: 0,
        message: 'Arquivo rejeitado: estrutura de backup ausente ou corrompida.',
      };
    }

    const backup = parsed as Partial<DatabaseBackup>;

    if (!backup.schemaVersion || typeof backup.schemaVersion !== 'number') {
      return {
        success: false,
        entriesImported: 0,
        customFoodsImported: 0,
        skippedDuplicates: 0,
        message: 'Arquivo rejeitado: versão de esquema (schemaVersion) ausente ou inválida.',
      };
    }

    if (backup.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        entriesImported: 0,
        customFoodsImported: 0,
        skippedDuplicates: 0,
        message: `Versão incompatível: este backup é do esquema v${backup.schemaVersion}, enquanto o app suporta até v${CURRENT_SCHEMA_VERSION}.`,
      };
    }

    const currentEntries = await storageRepository.getAllEntries();
    const existingIds = new Set(currentEntries.map((e) => e.id));

    let entriesImported = 0;
    let skippedDuplicates = 0;

    if (Array.isArray(backup.entries)) {
      for (const item of backup.entries) {
        if (item && item.id && item.type) {
          if (existingIds.has(item.id)) {
            skippedDuplicates++;
          } else {
            await storageRepository.saveEntry(item as RoutineEntry);
            existingIds.add(item.id);
            entriesImported++;
          }
        }
      }
    }

    let customFoodsImported = 0;
    if (Array.isArray(backup.customFoods)) {
      const currentFoods = await storageRepository.getCustomFoods();
      const existingFoodIds = new Set(currentFoods.map((f) => f.id));

      for (const food of backup.customFoods) {
        if (food && food.id && food.name && !existingFoodIds.has(food.id)) {
          await storageRepository.saveCustomFood(food as FoodItem);
          existingFoodIds.add(food.id);
          customFoodsImported++;
        }
      }
    }

    if (backup.preferences && typeof backup.preferences === 'object') {
      await storageRepository.savePreferences(backup.preferences);
    }

    return {
      success: true,
      entriesImported,
      customFoodsImported,
      skippedDuplicates,
      message: `Restauração concluída: ${entriesImported} novos registros importados, ${customFoodsImported} alimentos restaurados e ${skippedDuplicates} duplicatas ignoradas.`,
    };
  }
}

export const backupService = new BackupService();
