import { WorkoutEntry, WorkoutExercise, ExerciseSet } from '../../types/models';

export interface WorkoutStats {
  totalTonnageKg: number;
  totalSetsCount: number;
  totalRepsCount: number;
  exercisesCount: number;
  averageTonnagePerExercise: number;
}

export interface ExerciseProgressionItem {
  date: string;
  workoutTitle: string;
  maxWeightKg: number;
  totalVolumeKg: number;
  setsCount: number;
}

/**
 * Calcula o volume total de carga (tonelagem) e repetições de uma sessão de treino.
 */
export function calculateWorkoutStats(workout: WorkoutEntry): WorkoutStats {
  let totalTonnageKg = 0;
  let totalSetsCount = 0;
  let totalRepsCount = 0;

  if (workout.exercises && Array.isArray(workout.exercises)) {
    for (const ex of workout.exercises) {
      if (ex.sets && Array.isArray(ex.sets)) {
        for (const set of ex.sets) {
          if (set.completed !== false) {
            totalSetsCount++;
            totalRepsCount += set.reps || 0;
            totalTonnageKg += (set.reps || 0) * (set.weightKg || 0);
          }
        }
      }
    }
  }

  const exercisesCount = workout.exercises ? workout.exercises.length : 0;
  const averageTonnagePerExercise =
    exercisesCount > 0 ? Math.round(totalTonnageKg / exercisesCount) : 0;

  return {
    totalTonnageKg: Math.round(totalTonnageKg),
    totalSetsCount,
    totalRepsCount,
    exercisesCount,
    averageTonnagePerExercise,
  };
}

/**
 * Compara a evolução de carga exclusivamente entre sessões com o mesmo exercício.
 * REGRA RIGOROSA: Não compara exercícios diferentes nem inventa progressão.
 */
export function getExerciseProgression(
  exerciseName: string,
  workouts: WorkoutEntry[]
): ExerciseProgressionItem[] {
  if (!exerciseName.trim() || !workouts || workouts.length === 0) {
    return [];
  }

  const cleanTargetName = exerciseName.trim().toLowerCase();
  const progression: ExerciseProgressionItem[] = [];

  // Ordena treinos da data mais antiga para a mais recente
  const sortedWorkouts = [...workouts].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  for (const w of sortedWorkouts) {
    const matchingEx = w.exercises?.find(
      (e) => e.name.trim().toLowerCase() === cleanTargetName
    );

    if (matchingEx && matchingEx.sets && matchingEx.sets.length > 0) {
      let maxWeight = 0;
      let volume = 0;
      let validSets = 0;

      for (const s of matchingEx.sets) {
        if (s.weightKg > maxWeight) {
          maxWeight = s.weightKg;
        }
        volume += (s.reps || 0) * (s.weightKg || 0);
        validSets++;
      }

      progression.push({
        date: w.startTime.split('T')[0],
        workoutTitle: w.title,
        maxWeightKg: maxWeight,
        totalVolumeKg: Math.round(volume),
        setsCount: validSets,
      });
    }
  }

  return progression;
}
