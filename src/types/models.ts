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
  | 'cereals_grains'
  | 'legumes'
  | 'tubers'
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'fats_oils'
  | 'beverages'
  | 'sweets_snacks'
  | 'supplements';

export type MeasurementUnit =
  | 'g'
  | 'ml'
  | 'unit'
  | 'slice'
  | 'tablespoon'
  | 'teaspoon'
  | 'ladle'
  | 'scoop'
  | 'cup'
  | 'custom';

export interface NutritionFacts {
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fats: number | null;
  fiber?: number | null;
  source: DataSource;
  sourceDetails?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  aliases: string[];
  defaultUnit: MeasurementUnit;
  defaultServingSize: number;
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
  prepMethod?: string;
  calculatedNutrition?: NutritionFacts;
}

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper' | 'snack';

export interface MealEntry {
  id: string;
  schemaVersion: number;
  type: 'meal';
  timestamp: string;
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
  bedTime: string;
  fallAsleepTime?: string | null;
  wakeTime: string;
  durationMinutes: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
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
  level: 1 | 2 | 3 | 4 | 5;
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
  perceivedEffort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null;
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
  geminiApiKeyConfigured?: boolean;
}

export interface DatabaseBackup {
  appVersion: string;
  schemaVersion: number;
  exportedAt: string;
  entries: RoutineEntry[];
  customFoods: FoodItem[];
  preferences: UserPreferences;
}
