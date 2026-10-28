import { RoutineEntry, SleepEntry, HydrationEntry, CaffeineEntry, WorkoutEntry, EnergyEntry } from '../../types/models';

export interface WeeklySummaryResult {
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  totalEntriesCount: number;

  // Sono
  sleep: {
    totalMinutes: number;
    averageMinutesPerDay: number | null;
    averageQualityRating: number | null;
    daysSampled: number; // Quantidade real de dias com registro
    status: 'sufficient' | 'insufficient';
  };

  // Hidratação
  hydration: {
    totalVolumeMl: number;
    averageMlPerDay: number | null;
    daysSampled: number;
    status: 'sufficient' | 'insufficient';
  };

  // Cafeína
  caffeine: {
    totalMg: number;
    averageMgPerDay: number | null;
    dosesCount: number;
    daysSampled: number;
    status: 'sufficient' | 'insufficient';
  };

  // Treinos
  workout: {
    totalSessions: number;
    totalDurationMinutes: number;
    daysSampled: number;
  };

  // Energia
  energy: {
    averageLevel: number | null;
    ratingsCount: number;
    daysSampled: number;
    status: 'sufficient' | 'insufficient';
  };
}

/**
 * Função de cálculo analítico puro para o resumo de 7 dias.
 * Regra de Ouro: Dias sem registros NUNCA são computados como zero nas médias.
 */
export function calculateWeeklySummary(
  entries: RoutineEntry[],
  referenceDate: Date = new Date()
): WeeklySummaryResult {
  // Define os últimos 7 dias a partir da data de referência
  const datesInRange: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    datesInRange.push(d.toISOString().split('T')[0]);
  }

  const periodStart = datesInRange[0];
  const periodEnd = datesInRange[6];

  // Filtra entradas contidas na janela de 7 dias
  const weeklyEntries = entries.filter((entry) => {
    const entryDate = getEntryDateString(entry).split('T')[0];
    return datesInRange.includes(entryDate);
  });

  // 1. Agrupamento de Sono por dia
  const sleepByDay = new Map<string, SleepEntry[]>();
  // 2. Agrupamento de Hidratação por dia
  const hydrationByDay = new Map<string, number>();
  // 3. Agrupamento de Cafeína por dia
  const caffeineByDay = new Map<string, { totalMg: number; doses: number }>();
  // 4. Agrupamento de Treinos por dia
  const workoutsByDay = new Map<string, WorkoutEntry[]>();
  // 5. Agrupamento de Energia por dia
  const energyByDay = new Map<string, number[]>();

  for (const entry of weeklyEntries) {
    const dateKey = getEntryDateString(entry).split('T')[0];

    switch (entry.type) {
      case 'sleep': {
        const sleepEntry = entry as SleepEntry;
        const current = sleepByDay.get(dateKey) || [];
        current.push(sleepEntry);
        sleepByDay.set(dateKey, current);
        break;
      }
      case 'hydration': {
        const hydEntry = entry as HydrationEntry;
        const current = hydrationByDay.get(dateKey) || 0;
        hydrationByDay.set(dateKey, current + (hydEntry.volumeMl || 0));
        break;
      }
      case 'caffeine': {
        const cafEntry = entry as CaffeineEntry;
        const current = caffeineByDay.get(dateKey) || { totalMg: 0, doses: 0 };
        current.totalMg += cafEntry.estimatedCaffeineMg || 0;
        current.doses += 1;
        caffeineByDay.set(dateKey, current);
        break;
      }
      case 'workout': {
        const wEntry = entry as WorkoutEntry;
        const current = workoutsByDay.get(dateKey) || [];
        current.push(wEntry);
        workoutsByDay.set(dateKey, current);
        break;
      }
      case 'energy': {
        const eEntry = entry as EnergyEntry;
        const current = energyByDay.get(dateKey) || [];
        if (typeof eEntry.level === 'number') {
          current.push(eEntry.level);
        }
        energyByDay.set(dateKey, current);
        break;
      }
    }
  }

  // --- Cálculos de Sono ---
  const sleepDaysSampled = sleepByDay.size;
  let totalSleepMinutes = 0;
  let totalQualityScore = 0;
  let totalQualityCount = 0;

  sleepByDay.forEach((dayEntries) => {
    // Pega o sono principal do dia
    for (const item of dayEntries) {
      totalSleepMinutes += item.durationMinutes || 0;
      if (item.qualityRating) {
        totalQualityScore += item.qualityRating;
        totalQualityCount++;
      }
    }
  });

  const averageSleepMinutes =
    sleepDaysSampled > 0 ? Math.round(totalSleepMinutes / sleepDaysSampled) : null;
  const averageSleepQuality =
    totalQualityCount > 0 ? Number((totalQualityScore / totalQualityCount).toFixed(1)) : null;

  // --- Cálculos de Hidratação ---
  const hydrationDaysSampled = hydrationByDay.size;
  let totalWaterVolume = 0;
  hydrationByDay.forEach((volume) => {
    totalWaterVolume += volume;
  });
  const averageHydration =
    hydrationDaysSampled > 0 ? Math.round(totalWaterVolume / hydrationDaysSampled) : null;

  // --- Cálculos de Cafeína ---
  const caffeineDaysSampled = caffeineByDay.size;
  let totalCaffeineMg = 0;
  let totalCaffeineDoses = 0;
  caffeineByDay.forEach((item) => {
    totalCaffeineMg += item.totalMg;
    totalCaffeineDoses += item.doses;
  });
  const averageCaffeineMg =
    caffeineDaysSampled > 0 ? Math.round(totalCaffeineMg / caffeineDaysSampled) : null;

  // --- Cálculos de Treino ---
  let totalWorkoutSessions = 0;
  let totalWorkoutDuration = 0;
  workoutsByDay.forEach((wList) => {
    totalWorkoutSessions += wList.length;
    for (const w of wList) {
      totalWorkoutDuration += w.durationMinutes || 0;
    }
  });

  // --- Cálculos de Energia ---
  const energyDaysSampled = energyByDay.size;
  let totalEnergySum = 0;
  let totalEnergyRatings = 0;
  energyByDay.forEach((levels) => {
    for (const lvl of levels) {
      totalEnergySum += lvl;
      totalEnergyRatings++;
    }
  });
  const averageEnergy =
    totalEnergyRatings > 0 ? Number((totalEnergySum / totalEnergyRatings).toFixed(1)) : null;

  return {
    periodStart,
    periodEnd,
    totalEntriesCount: weeklyEntries.length,
    sleep: {
      totalMinutes: totalSleepMinutes,
      averageMinutesPerDay: averageSleepMinutes,
      averageQualityRating: averageSleepQuality,
      daysSampled: sleepDaysSampled,
      status: sleepDaysSampled >= 2 ? 'sufficient' : 'insufficient',
    },
    hydration: {
      totalVolumeMl: totalWaterVolume,
      averageMlPerDay: averageHydration,
      daysSampled: hydrationDaysSampled,
      status: hydrationDaysSampled >= 2 ? 'sufficient' : 'insufficient',
    },
    caffeine: {
      totalMg: totalCaffeineMg,
      averageMgPerDay: averageCaffeineMg,
      dosesCount: totalCaffeineDoses,
      daysSampled: caffeineDaysSampled,
      status: caffeineDaysSampled >= 1 ? 'sufficient' : 'insufficient',
    },
    workout: {
      totalSessions: totalWorkoutSessions,
      totalDurationMinutes: totalWorkoutDuration,
      daysSampled: workoutsByDay.size,
    },
    energy: {
      averageLevel: averageEnergy,
      ratingsCount: totalEnergyRatings,
      daysSampled: energyDaysSampled,
      status: totalEnergyRatings >= 2 ? 'sufficient' : 'insufficient',
    },
  };
}

function getEntryDateString(entry: RoutineEntry): string {
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
