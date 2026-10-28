# Modelo de Dados Canônico — MyRoutine AI (Schema v1.0)

Este documento especifica a tipagem oficial do sistema em TypeScript. Todas as entidades de persistência, cálculo e interface devem obedecer a este contrato.

---

## 1. Princípios de Modelagem
- **Identificadores Imutáveis:** Todo registro possui um `id` único (UUID v4).
- **Datas em ISO 8601:** Horários e carimbos de tempo utilizam strings ISO completas (ex: `2026-10-27T22:30:00.000Z`) com timezone local explicitado quando relevante.
- **Rastreabilidade de Fontes:** Valores numéricos e nutricionais carregam metadados sobre sua confiabilidade (`confirmed`, `estimated`, `user_provided`, `calculated`, `unknown`).
- **Valores Ausentes:** Campos não informados permanecem como `null` ou `undefined`, impedindo conversão espúria para zero.

---

## 2. Tipagens em TypeScript

```typescript
export const CURRENT_SCHEMA_VERSION = 1;

export type DataSource = 'confirmed' | 'estimated' | 'user_provided' | 'calculated' | 'unknown';

export type EntryType =
  | 'meal'
  | 'sleep'
  | 'caffeine'
  | 'hydration'
  | 'energy'
  | 'workout'
  | 'activity'
  | 'note';

export type FoodCategory =
  | 'cereals_grains'     // Categoria 1: Cereais e massas
  | 'legumes'            // Categoria 2: Feijões e leguminosas
  | 'tubers'             // Categoria 3: Tubérculos
  | 'proteins'           // Categoria 4: Proteínas
  | 'vegetables'         // Categoria 5: Verduras e legumes
  | 'fruits'             // Categoria 6: Frutas
  | 'dairy'              // Categoria 7: Laticínios
  | 'fats_oils'          // Categoria 8: Gorduras e complementos
  | 'beverages'          // Categoria 9: Bebidas
  | 'sweets_snacks'      // Categoria 10: Doces e lanches
  | 'supplements';       // Categoria 11: Suplementos

export type MeasurementUnit =
  | 'g'                  // gramas
  | 'ml'                 // mililitros
  | 'unit'               // unidade
  | 'slice'              // fatia
  | 'tablespoon'         // colher de sopa
  | 'teaspoon'           // colher de chá
  | 'ladle'              // concha
  | 'scoop'              // dosador/scoop
  | 'cup'                // xícara/copo
  | 'custom';            // personalizada

export interface NutritionFacts {
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fats: number | null;
  fiber?: number | null;
  source: DataSource;
  sourceDetails?: string; // ex: "TBCA 2024", "Rótulo do fabricante", "Estimativa média"
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  aliases: string[];
  defaultUnit: MeasurementUnit;
  defaultServingSize: number; // ex: 100g
  svgIconId: string;
  nutritionPerDefaultServing?: NutritionFacts;
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface MealItem {
  foodId: string;
  name: string;
  quantity: number;
  unit: MeasurementUnit;
  prepMethod?: string; // ex: "cozido", "grelhado", "cru", "assado"
  calculatedNutrition?: NutritionFacts;
}

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper' | 'snack';

export interface MealEntry {
  id: string;
  schemaVersion: number;
  type: 'meal';
  timestamp: string; // ISO 8601
  mealType: MealType;
  name?: string;
  items: MealItem[];
  totalNutrition?: NutritionFacts;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepEntry {
  id: string;
  schemaVersion: number;
  type: 'sleep';
  bedTime: string;           // ISO 8601 (ex: 2026-10-27T23:15:00)
  fallAsleepTime?: string | null; // ISO 8601 aproximado
  wakeTime: string;          // ISO 8601 (ex: 2026-10-28T07:00:00)
  durationMinutes: number;   // Calculado estritamente respeitando virada de meia-noite
  qualityRating: 1 | 2 | 3 | 4 | 5; // 1 = péssimo, 5 = excelente
  awakeningsCount?: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaffeineEntry {
  id: string;
  schemaVersion: number;
  type: 'caffeine';
  timestamp: string;
  beverageName: string;
  amount: number;
  unit: MeasurementUnit;
  estimatedCaffeineMg: number | null;
  source: DataSource;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HydrationEntry {
  id: string;
  schemaVersion: number;
  type: 'hydration';
  timestamp: string;
  liquidType: 'water' | 'sparkling_water' | 'tea' | 'other';
  volumeMl: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EnergyContext =
  | 'upon_waking'
  | 'during_work'
  | 'arriving_home'
  | 'pre_workout'
  | 'post_workout'
  | 'before_bed'
  | 'custom';

export interface EnergyEntry {
  id: string;
  schemaVersion: number;
  type: 'energy';
  timestamp: string;
  level: 1 | 2 | 3 | 4 | 5; // 1 = muito baixa/esgotado, 5 = excelente/vigoroso
  context: EnergyContext;
  customContextLabel?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  restSeconds?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutEntry {
  id: string;
  schemaVersion: number;
  type: 'workout';
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  modality: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'mixed' | 'other';
  title: string;
  exercises: WorkoutExercise[];
  perceivedEffort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null; // RPE Borg 1-10
  energyBefore?: 1 | 2 | 3 | 4 | 5 | null;
  energyAfter?: 1 | 2 | 3 | 4 | 5 | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  schemaVersion: number;
  type: 'activity';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  activityType: 'walking' | 'work' | 'commute' | 'chores' | 'other';
  distanceKm?: number | null;
  perceivedEffort?: 1 | 2 | 3 | 4 | 5 | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RoutineEntry =
  | MealEntry
  | SleepEntry
  | CaffeineEntry
  | HydrationEntry
  | EnergyEntry
  | WorkoutEntry
  | ActivityEntry;

export interface UserPreferences {
  schemaVersion: number;
  name?: string;
  workHours?: { start: string; end: string } | null;
  targetWaterMl?: number | null;
  preferredUnits: {
    weight: 'kg' | 'lbs';
    volume: 'ml' | 'oz';
  };
  reminderPreferences?: {
    hydration: boolean;
    meals: boolean;
    sleep: boolean;
    workout: boolean;
  };
  geminiApiKeyConfigured?: boolean; // Booleano indicador, sem expor o segredo
}

export interface DatabaseBackup {
  appVersion: string;
  schemaVersion: number;
  exportedAt: string;
  entries: RoutineEntry[];
  customFoods: FoodItem[];
  preferences: UserPreferences;
}
```
